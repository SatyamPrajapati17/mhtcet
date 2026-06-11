import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'data/data_service.dart';
import 'services/auth_service.dart';
import 'screens/home_screen.dart';
import 'screens/predict_screen.dart';
import 'screens/colleges_screen.dart';
import 'screens/college_detail_screen.dart';
import 'screens/compare_screen.dart';
import 'screens/feedback_screen.dart';
import 'screens/privacy_screen.dart';
import 'screens/sign_in_screen.dart';
import 'utils/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Load the data before running the app
  final dataService = DataService();
  await dataService.loadData();

  runApp(const CETCounselApp());
}

class CETCounselApp extends StatelessWidget {
  const CETCounselApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CETCounsel AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const AuthGate(),
      routes: {
        '/predict': (context) => const PredictScreen(),
        '/colleges': (context) => const CollegesScreen(),
        '/compare': (context) => const CompareScreen(),
        '/feedback': (context) => const FeedbackScreen(),
        '/privacy': (context) => const PrivacyScreen(),
        '/college-detail': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          if (args is String) {
            return CollegeDetailScreen(collegeCode: args);
          }
          return const PredictScreen();
        },
      },
    );
  }
}

/// AuthGate listens to auth state and shows either SignInScreen or MainShell
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final _auth = AuthService();
  bool _isChecking = true;
  late final _authSubscription;

  @override
  void initState() {
    super.initState();
    // Listen to auth state changes
    _authSubscription = _auth.authStateChanges.listen((user) {
      if (mounted) {
        setState(() => _isChecking = false);
      }
    });
  }

  @override
  void dispose() {
    _authSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.terracotta500),
        ),
      );
    }

    return _auth.isSignedIn ? const MainShell() : const SignInScreen();
  }
}

/// Main shell with bottom navigation for the primary sections
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  final _auth = AuthService();
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    PredictScreen(),
    CollegesScreen(),
    CompareScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        decoration: BoxDecoration(
          color: AppTheme.cream50.withValues(alpha: 0.95),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: AppTheme.cream200.withValues(alpha: 0.8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (i) => setState(() => _currentIndex = i),
            backgroundColor: Colors.transparent,
            elevation: 0,
            selectedItemColor: AppTheme.terracotta500,
            unselectedItemColor: AppTheme.nut400,
            selectedFontSize: 10,
            unselectedFontSize: 10,
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.psychology_outlined),
                activeIcon: Icon(Icons.psychology),
                label: 'Predict',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.business_outlined),
                activeIcon: Icon(Icons.business),
                label: 'Colleges',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.compare_arrows_outlined),
                activeIcon: Icon(Icons.compare_arrows),
                label: 'Compare',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
