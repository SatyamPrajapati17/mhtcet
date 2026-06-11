import 'package:flutter/material.dart';
import '../data/data_service.dart';
import '../models/prediction_model.dart';
import '../utils/app_theme.dart';
import '../utils/prediction_engine.dart';
import '../widgets/result_card.dart';

class PredictScreen extends StatefulWidget {
  const PredictScreen({super.key});

  @override
  State<PredictScreen> createState() => _PredictScreenState();
}

class _PredictScreenState extends State<PredictScreen> {
  final _data = DataService();
  final _engine = PredictionEngine();
  final _percentileController = TextEditingController();

  String _category = 'GOPENS';
  String _gender = '';
  String? _selectedCity;
  String? _selectedBranch;
  bool _tfws = false;
  int _year = 2024;
  int _capRound = 3;
  bool _isLoading = false;

  Predictions? _predictions;
  String? _error;

  final List<Map<String, String>> _categories = [
    {'value': 'GOPENS', 'label': 'Open (General)'},
    {'value': 'GSCS', 'label': 'SC'},
    {'value': 'GSTS', 'label': 'ST'},
    {'value': 'GVJS', 'label': 'VJ'},
    {'value': 'GNT1S', 'label': 'NT1'},
    {'value': 'GNT2S', 'label': 'NT2'},
    {'value': 'GNT3S', 'label': 'NT3'},
    {'value': 'GOBCS', 'label': 'OBC'},
    {'value': 'EWS', 'label': 'EWS'},
  ];

  @override
  void initState() {
    super.initState();
    _year = _data.years.isNotEmpty ? _data.years.reduce((a, b) => a > b ? a : b) : 2024;
  }

  @override
  void dispose() {
    _percentileController.dispose();
    super.dispose();
  }

  void _predict() {
    final percentileText = _percentileController.text.trim();
    if (percentileText.isEmpty) return;

    final percentile = double.tryParse(percentileText);
    if (percentile == null || percentile <= 0 || percentile > 100) {
      setState(() => _error = 'Please enter a valid percentile (0-100)');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _predictions = null;
    });

    // Simulate a brief delay for UX
    Future.delayed(const Duration(milliseconds: 300), () {
      try {
        final results = _engine.predict(
          percentile: percentile,
          category: _category,
          gender: _gender.isNotEmpty ? _gender : null,
          city: _selectedCity,
          branch: _selectedBranch,
          tfws: _tfws,
          year: _year,
          capRound: _capRound,
        );
        setState(() {
          _predictions = results;
          _isLoading = false;
        });
      } catch (e) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('College Predictor'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ── Form Card ──
            Container(
              decoration: AppTheme.doppelOuter(),
              child: Container(
                decoration: AppTheme.doppelInner(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.terracotta500.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.psychology, size: 20, color: AppTheme.terracotta500),
                        ),
                        const SizedBox(width: 12),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('College Predictor', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.nut900)),
                            Text('Enter your MHT-CET details', style: TextStyle(fontSize: 12, color: AppTheme.nut400)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Percentile
                    const Text('MHT-CET Percentile *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _percentileController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        hintText: 'e.g. 95.50',
                        prefixIcon: Icon(Icons.percent, size: 18),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Category
                    const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _category,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.category, size: 18),
                      ),
                      items: _categories.map((c) => DropdownMenuItem(
                        value: c['value'],
                        child: Text(c['label']!, style: const TextStyle(fontSize: 14)),
                      )).toList(),
                      onChanged: (v) => setState(() => _category = v!),
                    ),
                    const SizedBox(height: 16),

                    // Gender
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.cream50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.cream200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Gender', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: _gender.isEmpty ? null : _gender,
                            decoration: const InputDecoration(
                              hintText: 'All Genders',
                            ),
                            items: const [
                              DropdownMenuItem(value: 'Male', child: Text('Male')),
                              DropdownMenuItem(value: 'Female', child: Text('Female')),
                            ],
                            onChanged: (v) => setState(() => _gender = v ?? ''),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _gender == 'Female'
                                ? 'Includes Ladies quota (L-category) seats'
                                : _gender == 'Male'
                                    ? 'Shows General category seats'
                                    : 'Shows all available seats',
                            style: const TextStyle(fontSize: 11, color: AppTheme.nut400),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // City
                    const Text('City', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedCity,
                      decoration: const InputDecoration(
                        hintText: 'All Cities',
                        prefixIcon: Icon(Icons.location_on, size: 18),
                      ),
                      items: _data.cities.map((c) => DropdownMenuItem(
                        value: c,
                        child: Text(c, style: const TextStyle(fontSize: 14)),
                      )).toList()
                        ..insert(0, const DropdownMenuItem(value: null, child: Text('All Cities'))),
                      onChanged: (v) => setState(() => _selectedCity = v),
                    ),
                    const SizedBox(height: 16),

                    // Branch
                    const Text('Branch', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedBranch,
                      decoration: const InputDecoration(
                        hintText: 'All Branches',
                        prefixIcon: Icon(Icons.school, size: 18),
                      ),
                      items: _data.branchNames.map((b) => DropdownMenuItem(
                        value: b,
                        child: Text(b, style: const TextStyle(fontSize: 14)),
                      )).toList()
                        ..insert(0, const DropdownMenuItem(value: null, child: Text('All Branches'))),
                      onChanged: (v) => setState(() => _selectedBranch = v),
                    ),
                    const SizedBox(height: 16),

                    // Year & CAP Round
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Data Year', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                              const SizedBox(height: 6),
                              DropdownButtonFormField<int>(
                                initialValue: _year,
                                items: _data.years.map((y) => DropdownMenuItem(
                                  value: y,
                                  child: Text('$y-${(y + 1) % 100}', style: const TextStyle(fontSize: 14)),
                                )).toList(),
                                onChanged: (v) => setState(() => _year = v!),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('CAP Round', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.nut700)),
                              const SizedBox(height: 6),
                              DropdownButtonFormField<int>(
                                initialValue: _capRound,
                                items: const [
                                  DropdownMenuItem(value: 0, child: Text('All Rounds')),
                                  DropdownMenuItem(value: 3, child: Text('Round 3 (Final)')),
                                  DropdownMenuItem(value: 2, child: Text('Round 2')),
                                  DropdownMenuItem(value: 1, child: Text('Round 1')),
                                ],
                                onChanged: (v) => setState(() => _capRound = v!),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // TFWS checkbox
                    CheckboxListTile(
                      value: _tfws,
                      onChanged: (v) => setState(() => _tfws = v ?? false),
                      title: const Text('TFWS (Tuition Fee Waiver)', style: TextStyle(fontSize: 13, color: AppTheme.nut600)),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppTheme.terracotta500,
                      dense: true,
                    ),
                    const SizedBox(height: 16),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _predict,
                        icon: _isLoading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppTheme.cream50,
                                ),
                              )
                            : const Icon(Icons.psychology, size: 18),
                        label: Text(_isLoading ? 'Predicting...' : 'Predict Colleges'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // ── Results ──
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.noChanceBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.noChanceBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppTheme.noChanceRed, size: 20),
                    const SizedBox(width: 12),
                    Expanded(child: Text(_error!, style: const TextStyle(color: AppTheme.noChanceRed, fontSize: 13))),
                  ],
                ),
              ),

            if (_predictions != null && !_isLoading) _buildResults(),
          ],
        ),
      ),
    );
  }

  Widget _buildResults() {
    final p = _predictions!;
    if (p.isEmpty) {
      return Container(
        decoration: AppTheme.doppelOuter(),
        child: Container(
          decoration: AppTheme.doppelInner(),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const Icon(Icons.info_outline, color: AppTheme.terracotta500, size: 24),
              const SizedBox(height: 8),
              Text(
                'No predictions found for ${p.metadata.inputCategory} in ${p.metadata.year}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.nut800),
              ),
              if (p.metadata.availableYears.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text(
                  'Data is available for other years. Try switching to a different year.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.nut400),
                ),
              ],
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Metadata
        Container(
          decoration: AppTheme.doppelOuter(),
          child: Container(
            decoration: AppTheme.doppelInner(),
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Prediction Results',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.nut900)),
                      const SizedBox(height: 4),
                      Text(
                        'Based on ${p.metadata.inputPercentile} percentile'
                        '${p.metadata.inputGender != null ? ' (${p.metadata.inputGender})' : ''}'
                        ' in ${p.metadata.inputCategory} category for ${p.metadata.year}'
                        ' (${p.metadata.capRound == 0 ? 'All Rounds' : 'CAP Round ${p.metadata.capRound}'})',
                        style: const TextStyle(fontSize: 12, color: AppTheme.nut400),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.terracotta500.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: AppTheme.terracotta200),
                  ),
                  child: Text(
                    '${p.metadata.totalPredictions} matches',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.terracotta600),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        _buildLevelSection('Safe Colleges', _predictions!.safe, PredictionLevel.safe, Icons.check_circle),
        _buildLevelSection('Moderate Colleges', _predictions!.moderate, PredictionLevel.moderate, Icons.remove_circle_outline),
        _buildLevelSection('Dream Colleges', _predictions!.dream, PredictionLevel.dream, Icons.bolt),
        _buildLevelSection('Unlikely', _predictions!.noChance, PredictionLevel.noChance, Icons.cancel),
      ],
    );
  }

  Widget _buildLevelSection(String title, List<PredictionResult> results, PredictionLevel level, IconData icon) {
    if (results.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: level.badgeColor),
              const SizedBox(width: 6),
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.nut900)),
              const Spacer(),
              Text('${results.length} colleges',
                  style: const TextStyle(fontSize: 11, color: AppTheme.nut400)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            decoration: AppTheme.doppelOuter(),
            child: Container(
              decoration: AppTheme.doppelInner(),
              padding: const EdgeInsets.all(4),
              child: Column(
                children: results.map((r) => ResultCard(
                  result: r,
                  onTap: () => Navigator.pushNamed(context, '/college-detail', arguments: r.collegeCode),
                )).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
