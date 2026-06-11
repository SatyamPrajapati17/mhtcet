enum PredictionLevel { safe, moderate, dream, noChance }

class PredictionResult {
  final String collegeCode;
  final String collegeName;
  final String collegeCity;
  final String branchCode;
  final String branchName;
  final String category;
  final double closingPercentile;
  final int closingRank;
  final int year;
  final int capRound;
  final PredictionLevel level;
  final double score;

  const PredictionResult({
    required this.collegeCode,
    required this.collegeName,
    required this.collegeCity,
    required this.branchCode,
    required this.branchName,
    required this.category,
    required this.closingPercentile,
    required this.closingRank,
    required this.year,
    required this.capRound,
    required this.level,
    required this.score,
  });

  String get levelLabel {
    switch (level) {
      case PredictionLevel.safe:
        return 'Safe';
      case PredictionLevel.moderate:
        return 'Moderate';
      case PredictionLevel.dream:
        return 'Dream';
      case PredictionLevel.noChance:
        return 'Unlikely';
    }
  }
}

class PredictionMetadata {
  final int totalPredictions;
  final double inputPercentile;
  final String inputCategory;
  final String? inputGender;
  final int year;
  final int capRound;
  final List<int> availableYears;

  const PredictionMetadata({
    required this.totalPredictions,
    required this.inputPercentile,
    required this.inputCategory,
    this.inputGender,
    required this.year,
    required this.capRound,
    this.availableYears = const [],
  });
}
