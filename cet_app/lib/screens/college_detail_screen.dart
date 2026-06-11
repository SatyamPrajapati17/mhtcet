import 'package:flutter/material.dart';
import '../data/data_service.dart';
import '../models/cutoff_model.dart';
import '../utils/app_theme.dart';

class CollegeDetailScreen extends StatefulWidget {
  final String collegeCode;

  const CollegeDetailScreen({super.key, required this.collegeCode});

  @override
  State<CollegeDetailScreen> createState() => _CollegeDetailScreenState();
}

class _CollegeDetailScreenState extends State<CollegeDetailScreen> {
  final _data = DataService();
  int? _selectedYear;
  int? _selectedCapRound;

  @override
  void initState() {
    super.initState();
    final years = _data.getYearsForCollege(widget.collegeCode);
    if (years.isNotEmpty) _selectedYear = years.first;
  }

  @override
  Widget build(BuildContext context) {
    final college = _data.getCollege(widget.collegeCode);
    if (college == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('College')),
        body: const Center(child: Text('College not found')),
      );
    }

    final allCutoffs = _data.getCutoffsForCollege(widget.collegeCode);
    final branchNames = _data.getBranchesForCollege(widget.collegeCode);
    final years = _data.getYearsForCollege(widget.collegeCode);
    final capRounds = allCutoffs
        .where((c) => _selectedYear == null || c.year == _selectedYear)
        .map((c) => c.capRound)
        .toSet()
        .toList()
      ..sort();

    return Scaffold(
      appBar: AppBar(
        title: Text(college.name, style: const TextStyle(fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // College Header
            Container(
              decoration: AppTheme.doppelOuter(),
              child: Container(
                decoration: AppTheme.doppelInner(),
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.terracotta500.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.business, size: 24, color: AppTheme.terracotta500),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(college.name,
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.nut900)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.cream100,
                                  borderRadius: BorderRadius.circular(100),
                                  border: Border.all(color: AppTheme.cream300),
                                ),
                                child: Text(college.code,
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut500)),
                              ),
                              const SizedBox(width: 8),
                              Icon(Icons.location_on, size: 14, color: AppTheme.nut400),
                              const SizedBox(width: 2),
                              Text(college.displayCity,
                                  style: const TextStyle(fontSize: 13, color: AppTheme.nut400)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Filters
            Row(
              children: [
                if (years.length > 1)
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      value: _selectedYear,
                      decoration: const InputDecoration(
                        labelText: 'Year',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: years.map((y) => DropdownMenuItem(
                        value: y,
                        child: Text('$y-${(y + 1) % 100}', style: const TextStyle(fontSize: 13)),
                      )).toList(),
                      onChanged: (v) => setState(() {
                        _selectedYear = v;
                        _selectedCapRound = null;
                      }),
                    ),
                  ),
                if (capRounds.length > 1 && years.length > 1) const SizedBox(width: 12),
                if (capRounds.length > 1)
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      value: _selectedCapRound,
                      decoration: const InputDecoration(
                        labelText: 'CAP Round',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('All Rounds', style: TextStyle(fontSize: 13))),
                        ...capRounds.map((r) => DropdownMenuItem(
                          value: r,
                          child: Text('CAP $r', style: const TextStyle(fontSize: 13)),
                        )),
                      ],
                      onChanged: (v) => setState(() => _selectedCapRound = v),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Branches & Cutoffs
            ...branchNames.map((branchName) {
              // Find branch code
              final branchCodes = _data.getCollegeBranchCombos(widget.collegeCode)
                  .where((c) => _data.getBranch(c['branchCode'] as String)?.name == branchName)
                  .map((c) => c['branchCode'] as String)
                  .toSet();

              final filteredCutoffs = allCutoffs.where((c) {
                if (!branchCodes.contains(c.branchCode)) return false;
                if (_selectedYear != null && c.year != _selectedYear) return false;
                if (_selectedCapRound != null && c.capRound != _selectedCapRound) return false;
                return true;
              }).toList();

              if (filteredCutoffs.isEmpty) return const SizedBox.shrink();

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Container(
                  decoration: AppTheme.doppelOuter(),
                  child: Container(
                    decoration: AppTheme.doppelInner(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.school, size: 18, color: AppTheme.terracotta500),
                            const SizedBox(width: 8),
                            Text(branchName,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.nut900)),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Table header
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                          decoration: BoxDecoration(
                            border: Border(bottom: BorderSide(color: AppTheme.cream200)),
                          ),
                          child: const Row(
                            children: [
                              SizedBox(width: 40, child: Text('Year', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut400))),
                              SizedBox(width: 56, child: Text('Round', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut400))),
                              Expanded(child: Text('Category', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut400))),
                              SizedBox(width: 60, child: Text('Closing %ile', textAlign: TextAlign.right, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut400))),
                              SizedBox(width: 56, child: Text('Rank', textAlign: TextAlign.right, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.nut400))),
                            ],
                          ),
                        ),

                        // Table rows
                        ...filteredCutoffs.map((c) => Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                          decoration: BoxDecoration(
                            border: Border(bottom: BorderSide(color: AppTheme.cream200, width: 0.5)),
                          ),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 40,
                                child: Text('${c.year}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.nut800)),
                              ),
                              SizedBox(
                                width: 56,
                                child: Text('CAP ${c.capRound}', style: const TextStyle(fontSize: 12, color: AppTheme.nut600)),
                              ),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.cream100,
                                    borderRadius: BorderRadius.circular(100),
                                  ),
                                  child: Text(c.category, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis),
                                ),
                              ),
                              SizedBox(
                                width: 60,
                                child: Text('${c.percentile.toStringAsFixed(2)}%',
                                    textAlign: TextAlign.right,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.nut800)),
                              ),
                              SizedBox(
                                width: 56,
                                child: Text(_formatRank(c.rank),
                                    textAlign: TextAlign.right,
                                    style: const TextStyle(fontSize: 11, color: AppTheme.nut500)),
                              ),
                            ],
                          ),
                        )),
                      ],
                    ),
                  ),
                ),
              );
            }),

            if (branchNames.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.school, size: 48, color: AppTheme.nut300),
                      const SizedBox(height: 12),
                      const Text('No cutoff data available for this college.',
                          style: TextStyle(fontSize: 14, color: AppTheme.nut500)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatRank(int rank) {
    if (rank == 0) return '-';
    // Indian number format
    final str = rank.toString();
    if (str.length <= 3) return str;
    final last = str.substring(str.length - 3);
    final rest = str.substring(0, str.length - 3);
    return '${_formatRank(int.parse(rest))},$last';
  }
}
