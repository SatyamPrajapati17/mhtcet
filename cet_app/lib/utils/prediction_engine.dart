import '../models/prediction_model.dart';
import '../models/college_model.dart';
import '../models/cutoff_model.dart';
import '../data/data_service.dart';

/// Prediction engine ported from the TypeScript version.
/// Predicts colleges based on user percentile and filters.
class PredictionEngine {
  final DataService _data = DataService();

  /// Map from base category to all its seat-level variants (S, H, O)
  static final Map<String, List<String>> _categoryVariants = {
    'GOPEN': ['GOPENS', 'GOPENH', 'GOPENO'],
    'GSC': ['GSCS', 'GSCH', 'GSCO'],
    'GST': ['GSTS', 'GSTH', 'GSTO'],
    'GVJ': ['GVJS', 'GVJH', 'GVJO'],
    'GNT1': ['GNT1S', 'GNT1H', 'GNT1O'],
    'GNT2': ['GNT2S', 'GNT2H', 'GNT2O'],
    'GNT3': ['GNT3S', 'GNT3H', 'GNT3O'],
    'GOBC': ['GOBCS', 'GOBCH', 'GOBCO'],
    'LOPEN': ['LOPENS', 'LOPENH', 'LOPENO'],
    'LSC': ['LSCS', 'LSCH', 'LSCO'],
    'LST': ['LSTS', 'LSTH', 'LSTO'],
    'LVJ': ['LVJS', 'LVJH', 'LVJO'],
    'LNT1': ['LNT1S', 'LNT1H', 'LNT1O'],
    'LNT2': ['LNT2S', 'LNT2H', 'LNT2O'],
    'LOBC': ['LOBCS', 'LOBCH', 'LOBCO'],
  };

  /// Get category variants for a given category code
  List<String> getCategoryVariants(String category) {
    // Check for TFWS, EWS, MI, DEFOPENS, etc.
    if (category == 'TFWS' || category == 'EWS' || category == 'MI') {
      return [category];
    }

    // Check for DEF categories
    if (category.startsWith('DEF') || category.startsWith('PWD') || category.startsWith('SDEF')) {
      return [category];
    }

    // Strip trailing S/H/O
    for (final entry in _categoryVariants.entries) {
      if (category.startsWith(entry.key)) {
        final lastChar = category.substring(entry.key.length);
        if (lastChar == 'S' || lastChar == 'H' || lastChar == 'O') {
          return _categoryVariants[entry.key]!;
        }
        // Also include if it matches exactly (e.g., "GOPENS" input)
        if (entry.value.contains(category)) {
          return entry.value;
        }
      }
    }

    // If it's a base category without suffix, try to find it
    if (_categoryVariants.containsKey(category)) {
      return _categoryVariants[category]!;
    }

    return [category];
  }

  /// City suburb expansion (same as TypeScript version)
  static const Map<String, List<String>> citySuburbs = {
    'Navi Mumbai': ['Panvel', 'Vashi', 'Nerul', 'Airoli', 'Ghansoli', 'Belapur', 'Kharghar', 'Kamothe', 'Kalamboli', 'New Panvel'],
    'Mumbai': ['Andheri', 'Bhayander', 'Bhiwandi', 'Kandivali', 'Matunga', 'Boisar', 'Palghar'],
    'Pune': ['Pimpri', 'Chinchwad', 'Haveli', 'Pisoli', 'Ravet', 'Sasewadi', 'Talegaon', 'Wagholi', 'Avasari Khurd'],
    'Sangli': ['Miraj'],
    'Amravati': ['Badnera', 'Shegaon'],
    'Nashik': ['Nepti', 'Nashik', 'Nadurbar'],
    'Kalyan': ['Dombivli', 'Ulhasnagar'],
    'Kolhapur': ['Ichalkaranji', 'Panhala'],
    'Solapur': ['Barshi'],
    'Nagpur': ['Ramtek', 'Wardha'],
  };

  // Build reverse lookup
  static final Map<String, String> _suburbToParent = () {
    final map = <String, String>{};
    for (final entry in citySuburbs.entries) {
      for (final suburb in entry.value) {
        map[suburb.toLowerCase()] = entry.key.toLowerCase();
      }
    }
    return map;
  }();

  /// Calculate prediction score (0-100) based on user percentile vs cutoff
  double _calculateScore(double percentile, double closingPercentile) {
    final gap = closingPercentile - percentile;

    if (gap <= 0) {
      // At or above cutoff => Safe
      return (100 + gap).clamp(80, 100);
    } else if (gap <= 2) {
      // Within 2% below cutoff => Moderate
      return 60 + (1 - gap / 2) * 20;
    } else if (gap <= 5) {
      // Within 2-5% below cutoff => Dream
      return 25 + (1 - (gap - 2) / 3) * 25;
    } else {
      // More than 5% below cutoff => No Chance
      return (15 - (gap - 5) * 3).clamp(0, 15);
    }
  }

  /// Classify level based on score
  PredictionLevel _classifyLevel(double score) {
    if (score >= 75) return PredictionLevel.safe;
    if (score >= 50) return PredictionLevel.moderate;
    if (score >= 20) return PredictionLevel.dream;
    return PredictionLevel.noChance;
  }

  /// Predict colleges for the given input
  Predictions predict({
    required double percentile,
    required String category,
    String? gender,
    String? city,
    String? branch,
    bool tfws = false,
    bool minority = false,
    int year = 2024,
    int capRound = 0, // 0 = all rounds
  }) {
    // Expand category to variants
    List<String> categoriesToMatch = List.from(getCategoryVariants(category));

    // If Female, also include Ladies variants
    if (gender == 'Female' && category.startsWith('G')) {
      final ladiesCategory = 'L${category.substring(1)}';
      final ladiesVariants = getCategoryVariants(ladiesCategory);
      for (final v in ladiesVariants) {
        if (!categoriesToMatch.contains(v)) categoriesToMatch.add(v);
      }
    }

    // If TFWS, include TFWS category
    if (tfws) {
      if (!categoriesToMatch.contains('TFWS')) categoriesToMatch.add('TFWS');
    }

    // If minority, include MI category
    if (minority) {
      if (!categoriesToMatch.contains('MI')) categoriesToMatch.add('MI');
    }

    // Filter cutoffs
    var filtered = _data.cutoffs.where((c) {
      if (c.year != year) return false;
      if (capRound > 0 && c.capRound != capRound) return false;
      if (!categoriesToMatch.contains(c.category)) return false;
      return true;
    }).toList();

    // Sort by closing percentile descending
    filtered.sort((a, b) => b.percentile.compareTo(a.percentile));

    // Save branch filter string before it gets shadowed by the loop variable
    final branchFilter = branch;

    // Deduplicate by college + branch + category
    final seen = <String>{};
    final results = <PredictionResult>[];

    for (final c in filtered) {
      final key = '${c.collegeCode}-${c.branchCode}-${c.category}';
      if (seen.contains(key)) continue;
      seen.add(key);

      final college = _data.getCollege(c.collegeCode);
      final branchObj = _data.getBranch(c.branchCode);
      if (college == null || branchObj == null) continue;

      // Apply city filter with suburb expansion
      if (city != null && city.isNotEmpty) {
        final userCity = city.toLowerCase();
        final collegeCity = college.city.toLowerCase();

        // Check direct match or suburb match
        final parentCity = _suburbToParent[collegeCity];
        final isMatching = collegeCity == userCity ||
            parentCity == userCity ||
            (citySuburbs[city]?.any((s) => s.toLowerCase() == collegeCity) ?? false);

        if (!isMatching) continue;
      }

      // Apply branch filter
      if (branchFilter != null && branchFilter.isNotEmpty) {
        if (!branchObj.name.toLowerCase().contains(branchFilter.toLowerCase()) &&
            !branchObj.code.toLowerCase().contains(branchFilter.toLowerCase())) {
          continue;
        }
      }

      final score = _calculateScore(percentile, c.percentile);
      final level = _classifyLevel(score);

      results.add(PredictionResult(
        collegeCode: c.collegeCode,
        collegeName: college.name,
        collegeCity: college.city,
        branchCode: c.branchCode,
        branchName: branchObj.name,
        category: c.category,
        closingPercentile: c.percentile,
        closingRank: c.rank,
        year: c.year,
        capRound: c.capRound,
        level: level,
        score: score,
      ));
    }

    // Sort by score descending
    results.sort((a, b) => b.score.compareTo(a.score));

    // Limit to top 500
    final topResults = results.take(500).toList();

    // Check available years if no results
    List<int> availableYears = [];
    if (results.isEmpty) {
      final yearCategories = _data.cutoffs
          .where((c) => categoriesToMatch.contains(c.category))
          .map((c) => c.year)
          .toSet();
      availableYears = yearCategories.toList()..sort();
    }

    return Predictions(
      safe: topResults.where((r) => r.level == PredictionLevel.safe).toList(),
      moderate: topResults.where((r) => r.level == PredictionLevel.moderate).toList(),
      dream: topResults.where((r) => r.level == PredictionLevel.dream).toList(),
      noChance: topResults.where((r) => r.level == PredictionLevel.noChance).toList(),
      metadata: PredictionMetadata(
        totalPredictions: results.length,
        inputPercentile: percentile,
        inputCategory: category,
        inputGender: gender,
        year: year,
        capRound: capRound,
        availableYears: availableYears,
      ),
    );
  }
}

class Predictions {
  final List<PredictionResult> safe;
  final List<PredictionResult> moderate;
  final List<PredictionResult> dream;
  final List<PredictionResult> noChance;
  final PredictionMetadata metadata;

  const Predictions({
    required this.safe,
    required this.moderate,
    required this.dream,
    required this.noChance,
    required this.metadata,
  });

  bool get isEmpty => safe.isEmpty && moderate.isEmpty && dream.isEmpty && noChance.isEmpty;
}
