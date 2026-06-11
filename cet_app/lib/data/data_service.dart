import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/college_model.dart';
import '../models/cutoff_model.dart';

class DataService {
  static final DataService _instance = DataService._();
  factory DataService() => _instance;
  DataService._();

  bool _loaded = false;
  final List<College> _colleges = [];
  final List<Branch> _branches = [];
  final List<Cutoff> _cutoffs = [];
  final Map<String, College> _collegeByCode = {};
  final Map<String, Branch> _branchByCode = {};
  Set<String> _cities = {};
  final Set<String> _categories = {};
  final Set<int> _years = {};
  List<String> _branchNames = [];

  bool get isLoaded => _loaded;
  List<College> get colleges => _colleges;
  List<Cutoff> get cutoffs => _cutoffs;
  Set<String> get cities => _cities;
  Set<String> get categories => _categories;
  Set<int> get years => _years;
  List<String> get branchNames => _branchNames;

  College? getCollege(String code) => _collegeByCode[code];
  Branch? getBranch(String code) => _branchByCode[code];

  Future<void> loadData() async {
    if (_loaded) return;

    final jsonString = await rootBundle.loadString('assets/data/mhtcet_data.json');
    final json = jsonDecode(jsonString) as Map<String, dynamic>;

    // Parse colleges
    for (final item in json['colleges'] as List<dynamic>) {
      final college = College.fromJson(item as Map<String, dynamic>);
      _colleges.add(college);
      _collegeByCode[college.code] = college;
      if (college.city.isNotEmpty) {
        _cities.add(college.city);
      }
    }

    // Parse branches
    for (final item in json['branches'] as List<dynamic>) {
      final branch = Branch.fromJson(item as Map<String, dynamic>);
      _branches.add(branch);
      _branchByCode[branch.code] = branch;
      _branchNames.add(branch.name);
    }

    // Parse cutoffs
    for (final item in json['cutoffs'] as List<dynamic>) {
      final cutoff = Cutoff.fromCompactArray(item as List<dynamic>);
      _cutoffs.add(cutoff);
      _categories.add(cutoff.category);
      _years.add(cutoff.year);
    }

    // Sort
    _colleges.sort((a, b) => a.name.compareTo(b.name));
    _branchNames = _branchNames.toSet().toList()..sort();
    _cities = _cities.toSet()..remove('');

    _loaded = true;
    print('Loaded ${_colleges.length} colleges, ${_branches.length} branches, ${_cutoffs.length} cutoffs');
  }

  /// Search colleges by name, code, or city
  List<College> searchColleges({String query = '', String? city, int page = 1, int limit = 30}) {
    var results = _colleges;

    if (query.isNotEmpty) {
      final q = query.toLowerCase();
      results = results.where((c) =>
        c.name.toLowerCase().contains(q) ||
        c.code.toLowerCase().contains(q) ||
        c.city.toLowerCase().contains(q)
      ).toList();
    }

    if (city != null && city.isNotEmpty) {
      results = results.where((c) =>
        c.city.toLowerCase() == city.toLowerCase()
      ).toList();
    }

    final total = results.length;
    final totalPages = (total / limit).ceil();
    final start = (page - 1) * limit;
    final end = start + limit > total ? total : start + limit;

    return results.sublist(start, end);
  }

  /// Get all cutoffs for a specific college
  List<Cutoff> getCutoffsForCollege(String collegeCode) {
    return _cutoffs.where((c) => c.collegeCode == collegeCode).toList();
  }

  /// Get unique branches for a college
  List<String> getBranchesForCollege(String collegeCode) {
    final codes = _cutoffs
        .where((c) => c.collegeCode == collegeCode)
        .map((c) => c.branchCode)
        .toSet();
    final result = <String>[];
    for (final code in codes) {
      final branch = _branchByCode[code];
      if (branch != null) result.add(branch.name);
    }
    return result.toSet().toList()..sort();
  }

  /// Get cutoff years for a college
  List<int> getYearsForCollege(String collegeCode) {
    return _cutoffs
        .where((c) => c.collegeCode == collegeCode)
        .map((c) => c.year)
        .toSet()
        .toList()
      ..sort((a, b) => b.compareTo(a));
  }

  /// Get unique college+branch combinations for comparison
  List<Map<String, dynamic>> getCollegeBranchCombos(String collegeCode) {
    final combos = <String, List<Cutoff>>{};
    for (final c in _cutoffs.where((c) => c.collegeCode == collegeCode)) {
      final key = '${c.collegeCode}-${c.branchCode}';
      combos.putIfAbsent(key, () => []);
      combos[key]!.add(c);
    }
    return combos.entries.map((e) {
      final parts = e.key.split('-');
      return {
        'collegeCode': parts[0],
        'branchCode': parts[1],
        'cutoffs': e.value,
      };
    }).toList();
  }

  /// Get all unique college codes
  List<String> get allCollegeCodes => _colleges.map((c) => c.code).toList();

  /// Get all college names for suggestions
  List<String> get allCollegeNames => _colleges.map((c) => c.name).toList();
}
