import 'package:flutter/material.dart';
import '../data/data_service.dart';
import '../models/college_model.dart';
import '../models/cutoff_model.dart';
import '../utils/app_theme.dart';

class CompareScreen extends StatefulWidget {
  const CompareScreen({super.key});

  @override
  State<CompareScreen> createState() => _CompareScreenState();
}

class _CompareScreenState extends State<CompareScreen> {
  final _data = DataService();
  final _searchControllers = <TextEditingController>[];
  final _selectedCodes = <String?>[null, null];

  // Comparison results
  List<_CollegeCompareData>? _results;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _searchControllers.add(TextEditingController());
    _searchControllers.add(TextEditingController());
  }

  @override
  void dispose() {
    for (final c in _searchControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _addSlot() {
    if (_selectedCodes.length >= 4) return;
    setState(() {
      _selectedCodes.add(null);
      _searchControllers.add(TextEditingController());
    });
  }

  void _removeSlot(int index) {
    if (_selectedCodes.length <= 2) return;
    setState(() {
      _selectedCodes.removeAt(index);
      _searchControllers[index].dispose();
      _searchControllers.removeAt(index);
    });
  }

  void _selectCollege(int index, String code) {
    setState(() {
      _selectedCodes[index] = code;
      _searchControllers[index].text = _data.getCollege(code)?.name ?? '';
    });
  }

  void _compare() {
    final codes = _selectedCodes.where((c) => c != null).cast<String>().toList();
    if (codes.length < 2) return;

    setState(() {
      _isLoading = true;
      _results = null;
    });

    Future.delayed(const Duration(milliseconds: 200), () {
      final results = codes.map((code) {
        final college = _data.getCollege(code);
        if (college == null) return null;
        final cutoffs = _data.getCutoffsForCollege(code);
        return _CollegeCompareData(college: college, cutoffs: cutoffs);
      }).whereType<_CollegeCompareData>().toList();

      setState(() {
        _results = results;
        _isLoading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare Colleges'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.terracotta500.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.bar_chart, size: 22, color: AppTheme.terracotta500),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('College Comparison', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.nut900)),
                    Text('Compare up to 4 colleges side by side', style: TextStyle(fontSize: 12, color: AppTheme.nut400)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // College selectors
            Container(
              decoration: AppTheme.doppelOuter(),
              child: Container(
                decoration: AppTheme.doppelInner(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    ...List.generate(_selectedCodes.length, (i) => _buildCollegeSelector(i)),
                    if (_selectedCodes.length < 4)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: OutlinedButton.icon(
                          onPressed: _addSlot,
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Add College'),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 44),
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: (_selectedCodes.whereType<String>().length >= 2 && !_isLoading)
                            ? _compare
                            : null,
                        icon: _isLoading
                            ? const SizedBox(
                                width: 18, height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.cream50),
                              )
                            : const Icon(Icons.bar_chart, size: 18),
                        label: Text(_isLoading
                            ? 'Comparing...'
                            : 'Compare (${_selectedCodes.whereType<String>().length} colleges)'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Results
            if (_results != null) _buildComparisonTable(),
            if (_results == null && !_isLoading)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.bar_chart, size: 48, color: AppTheme.nut300),
                      const SizedBox(height: 12),
                      const Text('Compare colleges side by side',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.nut600)),
                      const SizedBox(height: 4),
                      const Text('Select 2-4 colleges and tap Compare.',
                          style: TextStyle(fontSize: 13, color: AppTheme.nut400)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCollegeSelector(int index) {
    final code = _selectedCodes[index];
    final college = code != null ? _data.getCollege(code) : null;
    final searchText = _searchControllers[index].text;

    // Filter colleges by search text
    List<String> suggestions = [];
    if (searchText.isNotEmpty) {
      final q = searchText.toLowerCase();
      suggestions = _data.allCollegeNames
          .where((n) => n.toLowerCase().contains(q))
          .take(5)
          .toList();
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('College ${index + 1}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
              const Spacer(),
              if (_selectedCodes.length > 2)
                GestureDetector(
                  onTap: () => _removeSlot(index),
                  child: const Icon(Icons.close, size: 16, color: AppTheme.nut400),
                ),
            ],
          ),
          const SizedBox(height: 4),
          TextField(
            controller: _searchControllers[index],
            decoration: InputDecoration(
              hintText: 'Search college...',
              prefixIcon: const Icon(Icons.search, size: 18),
              suffixIcon: college != null
                  ? Icon(Icons.check_circle, size: 18, color: AppTheme.safeGreen)
                  : null,
            ),
            onChanged: (v) {
              // Clear selection when text changes
              if (_selectedCodes[index] != null) {
                setState(() => _selectedCodes[index] = null);
              }
            },
          ),

          // Suggestions dropdown
          if (suggestions.isNotEmpty && college == null)
            Container(
              margin: const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                color: AppTheme.cream50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.cream200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: suggestions.map((name) {
                  final collegeObj = _data.colleges.firstWhere(
                    (c) => c.name == name,
                    orElse: () => _data.colleges.first,
                  );
                  return ListTile(
                    dense: true,
                    title: Text(name, style: const TextStyle(fontSize: 13)),
                    subtitle: collegeObj.city.isNotEmpty
                        ? Text(collegeObj.city, style: const TextStyle(fontSize: 11, color: AppTheme.nut400))
                        : null,
                    onTap: () => _selectCollege(index, collegeObj.code),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildComparisonTable() {
    if (_results!.isEmpty) return const SizedBox.shrink();

    // Collect unique branch categories from first college
    final firstCollegeCutoffs = _results!.first.cutoffs;
    final uniqueEntries = <String>[];
    final seen = <String>{};
    for (final c in firstCollegeCutoffs) {
      final key = '${c.year}-${c.capRound}-${c.category}';
      if (!seen.contains(key)) {
        seen.add(key);
        uniqueEntries.add(key);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Comparison Results',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.nut900)),
        const SizedBox(height: 16),

        // Horizontal scrollable table
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Table header
              Row(
                children: [
                  // Row label column
                  Container(
                    width: 120,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.cream100,
                      borderRadius: const BorderRadius.only(topLeft: Radius.circular(12)),
                      border: Border.all(color: AppTheme.cream200),
                    ),
                    child: const Text('Details',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.nut500)),
                  ),
                  ..._results!.map((r) => Container(
                    width: 160,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.cream200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.college.name,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.nut900),
                            maxLines: 2, overflow: TextOverflow.ellipsis),
                        if (r.college.city.isNotEmpty)
                          Text(r.college.city,
                              style: const TextStyle(fontSize: 10, color: AppTheme.nut400)),
                      ],
                    ),
                  )),
                ],
              ),

              // City row
              _buildCompareRow('City', _results!.map((r) => r.college.displayCity).toList()),
              // NAAC row
              _buildCompareRow('NAAC', _results!.map((r) => '').toList()),
              // Cutoff rows
              ...uniqueEntries.take(15).map((entry) {
                final parts = entry.split('-');
                final year = int.parse(parts[0]);
                final capRound = int.parse(parts[1]);
                final category = parts.sublist(2).join('-');

                return _buildCompareRow(
                  '$year CAP$capRound - $category',
                  _results!.map((r) {
                    final match = r.cutoffs.firstWhere(
                      (c) => c.year == year && c.capRound == capRound && c.category == category,
                      orElse: () => const Cutoff(
                        collegeCode: '', branchCode: '', year: 0, capRound: 0,
                        category: '', percentile: 0, rank: 0,
                      ),
                    );
                    return match.percentile > 0
                        ? '${match.percentile.toStringAsFixed(2)}%'
                        : '-';
                  }).toList(),
                  isLast: false,
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCompareRow(String label, List<String> values, {bool isLast = false}) {
    return Row(
      children: [
        Container(
          width: 120,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppTheme.cream200, width: isLast ? 0 : 0.5),
              left: BorderSide(color: AppTheme.cream200),
              right: BorderSide(color: AppTheme.cream200),
            ),
          ),
          child: Text(label,
              style: const TextStyle(fontSize: 11, color: AppTheme.nut500),
              maxLines: 2, overflow: TextOverflow.ellipsis),
        ),
        ...values.map((v) => Container(
          width: 160,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppTheme.cream200, width: isLast ? 0 : 0.5),
              right: BorderSide(color: AppTheme.cream200),
            ),
          ),
          child: Text(v == '-' ? '-' : v,
              style: TextStyle(
                fontSize: 12,
                fontWeight: v != '-' ? FontWeight.w500 : FontWeight.w400,
                color: v != '-' ? AppTheme.nut800 : AppTheme.nut300,
              )),
        )),
      ],
    );
  }
}

class _CollegeCompareData {
  final College college;
  final List<Cutoff> cutoffs;

  _CollegeCompareData({required this.college, required this.cutoffs});
}
