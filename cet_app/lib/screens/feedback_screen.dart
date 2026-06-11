import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../utils/app_theme.dart';

const String _feedbackFormUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLScgvxTRKSDiSlapychYzBN-Mpw3Z6mDaszVWRT6w5n7M5j25Q/viewform';

class FeedbackScreen extends StatelessWidget {
  const FeedbackScreen({super.key});

  Future<void> _openForm() async {
    final uri = Uri.parse(_feedbackFormUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Feedback'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // ── Feedback Card ──
            Container(
              decoration: AppTheme.doppelOuter(),
              child: Container(
                decoration: AppTheme.doppelInner(),
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 28),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.terracotta500.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.message_outlined,
                        size: 32,
                        color: AppTheme.terracotta500,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      "We'd Love to Hear From You",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.nut900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Your feedback helps us make CETCounsel AI better for everyone. '
                      'Whether it\'s a suggestion, a bug report, or just a thought — '
                      'we\'re all ears.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.nut500,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 28),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _openForm,
                        icon: const Icon(Icons.open_in_new, size: 18),
                        label: const Text('Open Feedback Form'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // ── Info Cards ──
            Row(
              children: [
                Expanded(
                  child: _InfoCard(
                    icon: Icons.lightbulb_outline,
                    title: 'Suggestions',
                    description:
                        'Have an idea for a new feature? Let us know what would make your counseling experience better.',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _InfoCard(
                    icon: Icons.bug_report_outlined,
                    title: 'Bug Reports',
                    description:
                        'Found something not working right? Tell us about it so we can fix it quickly.',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.forum_outlined,
              title: 'General Feedback',
              description:
                  'Anything else on your mind? We appreciate all kinds of input from our users.',
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.doppelOuter(),
      child: Container(
        decoration: AppTheme.doppelInner(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: AppTheme.terracotta500),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppTheme.nut900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              description,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.nut400,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
