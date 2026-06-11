import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── Hero Section ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 40, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Eyebrow
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceSecondary,
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: AppTheme.cream200),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.auto_awesome, size: 12, color: AppTheme.terracotta500),
                          SizedBox(width: 6),
                          Text(
                            'AI-POWERED MHT-CET COUNSELING',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: AppTheme.nut500,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Your AI Counselor\nfor Engineering\nAdmissions',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontSize: 32,
                        height: 1.05,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Predict colleges, analyze cutoffs, compare options, and get personalized AI counseling — all in one app.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 15,
                        color: AppTheme.nut400,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // CTA Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/predict'),
                            icon: const Icon(Icons.psychology, size: 18),
                            label: const Text('Predict Colleges'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/colleges'),
                            icon: const Icon(Icons.search, size: 18),
                            label: const Text('Browse Colleges'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),

            // ── Stats ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  decoration: AppTheme.doppelOuter(),
                  child: Container(
                    decoration: AppTheme.doppelInner(),
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _StatItem(value: '300+', label: 'Colleges', icon: Icons.school),
                        _StatItem(value: '138K+', label: 'Cutoffs', icon: Icons.trending_up),
                        _StatItem(value: '2022-24', label: 'Data Years', icon: Icons.bolt),
                        _StatItem(value: '3 Rnds', label: 'CAP Rounds', icon: Icons.shield),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(top: 40)),

            // ── Features ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Everything you need for smart counseling',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.nut900,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _FeatureCard(
                      icon: Icons.psychology,
                      title: 'AI College Prediction',
                      description:
                          'Enter your MHT-CET percentile and get personalized predictions classified as Safe, Moderate, or Dream colleges.',
                      onTap: () => Navigator.pushNamed(context, '/predict'),
                    ),
                    const SizedBox(height: 12),
                    _FeatureCard(
                      icon: Icons.search,
                      title: 'College Database',
                      description:
                          'Browse 300+ engineering colleges with detailed cutoff history, branch information, and key stats.',
                      onTap: () => Navigator.pushNamed(context, '/colleges'),
                    ),
                    const SizedBox(height: 12),
                    _FeatureCard(
                      icon: Icons.compare_arrows,
                      title: 'College Comparison',
                      description:
                          'Compare colleges side by side across cutoffs, location, and rankings to make informed decisions.',
                      onTap: () => Navigator.pushNamed(context, '/compare'),
                    ),
                  ],
                ),
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(top: 40)),

            // ── How It Works ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Three simple steps',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.nut900,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _StepCard(number: '01', title: 'Enter Your Details',
                        description: 'Input your MHT-CET percentile, category, and preferences.'),
                    const SizedBox(height: 12),
                    _StepCard(number: '02', title: 'Get AI Predictions',
                        description: 'Receive personalized college lists with Safe, Moderate, and Dream classifications.'),
                    const SizedBox(height: 12),
                    _StepCard(number: '03', title: 'Make Smart Decisions',
                        description: 'Compare colleges side by side and make data-driven admission decisions.'),
                  ],
                ),
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(top: 40)),

            // ── CTA Banner ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(40),
                    gradient: const LinearGradient(
                      colors: [
                        AppTheme.terracotta600,
                        AppTheme.terracotta500,
                        AppTheme.terracotta800,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Ready to find your\nperfect college?',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.cream50,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Start your AI-powered counseling journey now',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.terracotta100,
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () =>
                            Navigator.pushNamed(context, '/predict'),
                        icon: const Icon(Icons.psychology, size: 18),
                        label: const Text('Start Prediction'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.cream50,
                          foregroundColor: AppTheme.terracotta700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _StatItem({
    required this.value,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.nut900,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 11, color: AppTheme.terracotta500),
            const SizedBox(width: 3),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: AppTheme.nut400),
            ),
          ],
        ),
      ],
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback? onTap;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: AppTheme.doppelOuter(),
        child: Container(
          decoration: AppTheme.doppelInner(),
          padding: const EdgeInsets.all(20),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.terracotta500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 22, color: AppTheme.terracotta500),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.nut900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.nut400,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  final String number;
  final String title;
  final String description;

  const _StepCard({
    required this.number,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: AppTheme.doppelOuter(),
          child: Container(
            decoration: AppTheme.doppelInner(),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.terracotta500,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.nut900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.nut400,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
