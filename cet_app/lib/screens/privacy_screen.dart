import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

const List<Map<String, String>> _sections = [
  {
    'title': 'Information We Collect',
    'content':
        'When you use CETCounsel AI, we may collect information you provide directly, such as your MHT-CET percentile, category, gender, preferred city, branch interests, and other preferences used for college predictions. We also collect anonymous usage data to improve our prediction engine and user experience.',
  },
  {
    'title': 'How We Use Your Information',
    'content':
        'The information you provide is used solely to generate accurate college predictions and comparisons. We do not sell, rent, or share your personal data with third parties. Aggregated and anonymized data may be used for research and platform improvement.',
  },
  {
    'title': 'Data Storage & Security',
    'content':
        'We implement industry-standard security measures to protect your data. All data is stored securely and access is restricted to essential platform operations. While we strive to protect your information, no method of electronic storage is 100% secure.',
  },
  {
    'title': 'Cookies & Tracking',
    'content':
        'CETCounsel AI may use essential cookies to ensure the platform functions properly. We do not use tracking cookies for advertising purposes. You can configure your browser to reject cookies, though this may affect certain functionality.',
  },
  {
    'title': 'Third-Party Services',
    'content':
        'We may use third-party services for hosting, analytics, and infrastructure. These providers are contractually bound to protect your data and use it only for the services they provide to us.',
  },
  {
    'title': 'Data Retention',
    'content':
        'We retain your information only as long as necessary to provide our services. You may request deletion of your data by contacting us. Usage logs and anonymized data may be retained longer for analytical purposes.',
  },
  {
    'title': 'Your Rights',
    'content':
        'You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities. To exercise these rights, please contact us using the information below.',
  },
  {
    'title': 'Changes to This Policy',
    'content':
        'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.',
  },
  {
    'title': 'Contact Us',
    'content':
        'If you have questions or concerns about this Privacy Policy or your data, please reach out to our support team through the platform or contact us at shivamprajapati8451@gmail.com.',
  },
];

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Shield Icon & Intro ──
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.terracotta500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.shield_outlined, size: 22, color: AppTheme.terracotta500),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Privacy Policy',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.nut900)),
                  Text('Last updated: June 11, 2026',
                      style: TextStyle(fontSize: 11, color: AppTheme.nut400)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── Intro Card ──
          Container(
            decoration: AppTheme.doppelOuter(),
            child: Container(
              decoration: AppTheme.doppelInner(),
              padding: const EdgeInsets.all(20),
              child: const Text(
                'CETCounsel AI ("we," "our," or "us") is committed to protecting your privacy. '
                'This Privacy Policy explains how we collect, use, disclose, and safeguard your information '
                'when you use our platform. By using CETCounsel AI, you agree to the collection and use of '
                'information in accordance with this policy.',
                style: TextStyle(fontSize: 13, color: AppTheme.nut500, height: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // ── Sections ──
          for (final section in _sections) ...[
            Container(
              decoration: AppTheme.doppelOuter(),
              child: Container(
                decoration: AppTheme.doppelInner(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      section['title']!,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.nut900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      section['content']!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.nut500,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}
