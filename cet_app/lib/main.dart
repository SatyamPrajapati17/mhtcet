import 'package:flutter/material.dart';
import 'data/data_service.dart';
import 'screens/home_screen.dart';
import 'screens/predict_screen.dart';
import 'screens/colleges_screen.dart';
import 'screens/college_detail_screen.dart';
import 'screens/compare_screen.dart';
import 'utils/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

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
      home: const MainShell(),
      routes: {
        '/predict': (context) => const PredictScreen(),
        '/colleges': (context) => const CollegesScreen(),
        '/compare': (context) => const CompareScreen(),
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

/// Main shell with bottom navigation for the primary sections
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
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
          color: AppTheme.cream50.withOpacity(0.95),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: AppTheme.cream200.withOpacity(0.8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
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
