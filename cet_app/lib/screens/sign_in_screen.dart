import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../utils/app_theme.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _auth = AuthService();
  bool _isLoading = false;
  String? _error;

  Future<void> _signIn() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _auth.signInWithGoogle();
      // Navigation is handled by auth state listener in main.dart
    } catch (e) {
      String message = e.toString();
      if (message.contains('cancelled')) {
        // User cancelled, don't show error
      } else {
        setState(() => _error =
            'Failed to sign in. Please check Firebase configuration and try again.');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 60),

                // ── Logo / Icon ──
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.terracotta500.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(
                    Icons.school,
                    size: 56,
                    color: AppTheme.terracotta500,
                  ),
                ),
                const SizedBox(height: 32),

                // ── Title ──
                const Text(
                  'CETCounsel AI',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.nut900,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'AI-powered MHT-CET college predictions\nand counseling',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: AppTheme.nut400,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 48),

                // ── Sign In Card ──
                Container(
                  decoration: AppTheme.doppelOuter(),
                  child: Container(
                    decoration: AppTheme.doppelInner(),
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      children: [
                        const Text(
                          'Sign in to continue',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.nut900,
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (!_auth.isFirebaseInitialized) ...[
                          const Text(
                            'Firebase is not configured for web/local debugging, so sign-in is disabled until setup is complete.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppTheme.nut500,
                              fontSize: 13,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        const SizedBox(height: 8),

                        // ── Google Sign-In Button ──
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed:
                                _isLoading || !_auth.isFirebaseInitialized ? null : _signIn,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppTheme.nut900,
                              side: const BorderSide(color: AppTheme.cream200),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            icon: _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppTheme.nut500,
                                    ),
                                  )
                                : Image.network(
                                    'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                                    width: 20,
                                    height: 20,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.g_mobiledata,
                                      size: 24,
                                      color: Colors.black54,
                                    ),
                                  ),
                            label: Text(
                              _isLoading ? 'Signing in...' : 'Sign in with Google',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),

                        // ── Error ──
                        if (_error != null) ...[
                          const SizedBox(height: 16),
                          Text(
                            _error!,
                            style: const TextStyle(
                              color: AppTheme.noChanceRed,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 40),

                // ── Footer ──
                const Text(
                  'Your data stays private. We only use\nGoogle to verify your identity.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.nut400,
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 20),

                // ── Privacy ──
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/privacy'),
                  child: const Text(
                    'Privacy Policy',
                    style: TextStyle(fontSize: 12, color: AppTheme.nut400),
                  ),
                ),

                const SizedBox(height: 60),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
