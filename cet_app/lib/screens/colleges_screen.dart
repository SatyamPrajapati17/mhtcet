import 'package:flutter/material.dart';
import '../data/data_service.dart';
import '../models/college_model.dart';
import '../utils/app_theme.dart';
import '../widgets/college_card.dart';

class CollegesScreen extends StatefulWidget {
  const CollegesScreen({super.key});

  @override
  State<CollegesScreen> createState() => _CollegesScreenState();
}

class _CollegesScreenState extends State<CollegesScreen> {
  final _data = DataService();
  final _searchController = TextEditingController();

  String _searchQuery = '';
  String? _selectedCity;
  int _page = 1;
  static const int _limit = 30;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<College> get _results {
    return _data.searchColleges(
      query: _searchQuery,
      city: _selectedCity,
      page: _page,
      limit: _limit,
    );
  }

  int get _total => _data.searchColleges(
    query: _searchQuery,
    city: _selectedCity,
  ).length;

  int get _totalPages => (_total / _limit).ceil();

  void _search() {
    setState(() {
      _searchQuery = _searchController.text.trim();
      _page = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final results = _results;

    return Scaffold(
      appBar: AppBar(
        title: const Text('MHT-CET Colleges'),
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
                  child: const Icon(Icons.business, size: 22, color: AppTheme.terracotta500),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Browse Engineering Colleges', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.nut900)),
                    Text('in Maharashtra', style: TextStyle(fontSize: 12, color: AppTheme.nut400)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search Bar
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search colleges by name, code, or city...',
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _search();
                        },
                      )
                    : null,
              ),
              onSubmitted: (_) => _search(),
            ),
            const SizedBox(height: 12),

            // City Filter
            DropdownButtonFormField<String>(
              value: _selectedCity,
              decoration: const InputDecoration(
                hintText: 'All Cities',
                prefixIcon: Icon(Icons.filter_list, size: 20),
              ),
              items: _data.cities.map((c) => DropdownMenuItem(
                value: c,
                child: Text(c, style: const TextStyle(fontSize: 14)),
              )).toList()
                ..insert(0, const DropdownMenuItem(value: null, child: Text('All Cities'))),
              onChanged: (v) => setState(() {
                _selectedCity = v;
                _page = 1;
              }),
            ),
            const SizedBox(height: 12),

            // Search Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _search,
                icon: const Icon(Icons.search, size: 18),
                label: const Text('Search'),
              ),
            ),
            const SizedBox(height: 20),

            // Results count
            if (_searchQuery.isNotEmpty || _selectedCity != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  'Showing ${(_page - 1) * _limit + 1}-${((_page) * _limit) > _total ? _total : (_page) * _limit} of $_total colleges',
                  style: const TextStyle(fontSize: 12, color: AppTheme.nut400),
                ),
              ),

            // College list
            ...results.map((college) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: CollegeCard(
                college: college,
                cutoffCount: _data.getCutoffsForCollege(college.code).length,
                onTap: () => Navigator.pushNamed(context, '/college-detail', arguments: college.code),
              ),
            )),

            if (results.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 60),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.business, size: 48, color: AppTheme.nut300),
                      const SizedBox(height: 16),
                      const Text('No colleges found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.nut800)),
                      const SizedBox(height: 4),
                      const Text('Try a different search term or browse all colleges.',
                          style: TextStyle(fontSize: 13, color: AppTheme.nut400)),
                    ],
                  ),
                ),
              ),

            // Pagination
            if (_totalPages > 1)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(
                      onPressed: _page > 1 ? () => setState(() => _page--) : null,
                      child: const Text('Previous'),
                    ),
                    const SizedBox(width: 12),
                    Text('Page $_page of $_totalPages',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut500)),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _page < _totalPages ? () => setState(() => _page++) : null,
                      child: const Text('Next'),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
