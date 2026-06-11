import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/prediction_model.dart';

/// CET Counsel AI - App Theme
/// Warm cream + terracotta palette inspired by the web version.

class AppTheme {
  // Colors
  static const Color cream50 = Color(0xFFFBF6EF);
  static const Color cream100 = Color(0xFFF5EDDF);
  static const Color cream200 = Color(0xFFEBE0CE);
  static const Color cream300 = Color(0xFFE0D2BB);
  static const Color cream400 = Color(0xFFD4C5B0);
  static const Color cream500 = Color(0xFFC8B8A0);
  static const Color cream600 = Color(0xFFB8A48E);
  static const Color cream700 = Color(0xFFA08C78);
  static const Color cream800 = Color(0xFF8B7355);
  static const Color cream900 = Color(0xFF6B5840);

  static const Color terracotta50 = Color(0xFFFDF0EA);
  static const Color terracotta100 = Color(0xFFF5DDD0);
  static const Color terracotta200 = Color(0xFFEBC0A8);
  static const Color terracotta300 = Color(0xFFDDA084);
  static const Color terracotta400 = Color(0xFFCE8A6A);
  static const Color terracotta500 = Color(0xFFBA6A4C);
  static const Color terracotta600 = Color(0xFFA85A3E);
  static const Color terracotta700 = Color(0xFF8A4A34);
  static const Color terracotta800 = Color(0xFF6E3C2A);
  static const Color terracotta900 = Color(0xFF542E20);

  static const Color nut50 = Color(0xFFF5EDDF);
  static const Color nut100 = Color(0xFFEBE0CE);
  static const Color nut200 = Color(0xFFD4C5B0);
  static const Color nut300 = Color(0xFFB8A48E);
  static const Color nut400 = Color(0xFF8B7355);
  static const Color nut500 = Color(0xFF6B5840);
  static const Color nut600 = Color(0xFF5A4834);
  static const Color nut700 = Color(0xFF4A3A2A);
  static const Color nut800 = Color(0xFF3A2C20);
  static const Color nut900 = Color(0xFF2C1810);

  static const Color surface = Color(0xFFEEE0CC);
  static const Color surfaceSecondary = Color(0xFFF5EDDF);

  // Status colors
  static const Color safeGreen = Color(0xFF3A6B4C);
  static const Color safeBg = Color(0xFFF0F5ED);
  static const Color safeBorder = Color(0xFFC8DCC8);

  static const Color moderateBlue = Color(0xFF3A4C6B);
  static const Color moderateBg = Color(0xFFEDEDF5);
  static const Color moderateBorder = Color(0xFFC8CCDC);

  static const Color dreamAmber = Color(0xFF8B6B3A);
  static const Color dreamBg = Color(0xFFF5F0ED);
  static const Color dreamBorder = Color(0xFFDCD0C0);

  static const Color noChanceRed = Color(0xFF8B3A3A);
  static const Color noChanceBg = Color(0xFFF5EDED);
  static const Color noChanceBorder = Color(0xFFDCC8C8);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: surface,
      colorScheme: const ColorScheme.light(
        primary: terracotta500,
        secondary: terracotta400,
        surface: cream50,
        onPrimary: cream50,
        onSecondary: cream50,
        onSurface: nut900,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: nut900,
          letterSpacing: -0.5,
        ),
        headlineMedium: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: nut900,
        ),
        titleLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: nut900,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: nut900,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: nut700,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: nut600,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: nut400,
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: nut700,
        ),
        labelSmall: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.5,
          color: nut400,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: terracotta500,
          foregroundColor: cream50,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(100),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: nut700,
          side: const BorderSide(color: cream300),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(100),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cream50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: cream300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: cream300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: terracotta500, width: 1.5),
        ),
        hintStyle: const TextStyle(color: nut400, fontSize: 14),
      ),
      dividerTheme: const DividerThemeData(
        color: cream200,
        thickness: 1,
        space: 0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: cream100,
        labelStyle: const TextStyle(color: nut600, fontSize: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
          side: const BorderSide(color: cream200),
        ),
      ),
    );
  }

  // Card styles
  static BoxDecoration doppelOuter({double radius = 32}) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(radius),
      gradient: LinearGradient(
        colors: [
          terracotta500.withValues(alpha: 0.08),
          terracotta500.withValues(alpha: 0.04),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    );
  }

  static BoxDecoration doppelInner({double radius = 30.5}) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(radius),
      color: cream50,
      boxShadow: [
        BoxShadow(
          color: Colors.white.withValues(alpha: 0.6),
          blurRadius: 1,
          offset: const Offset(0, 1),
        ),
      ],
    );
  }
}

// Extension for prediction level colors
extension PredictionLevelColors on PredictionLevel {
  Color get badgeColor {
    switch (this) {
      case PredictionLevel.safe:
        return AppTheme.safeGreen;
      case PredictionLevel.moderate:
        return AppTheme.moderateBlue;
      case PredictionLevel.dream:
        return AppTheme.dreamAmber;
      case PredictionLevel.noChance:
        return AppTheme.noChanceRed;
    }
  }

  Color get badgeBg {
    switch (this) {
      case PredictionLevel.safe:
        return AppTheme.safeBg;
      case PredictionLevel.moderate:
        return AppTheme.moderateBg;
      case PredictionLevel.dream:
        return AppTheme.dreamBg;
      case PredictionLevel.noChance:
        return AppTheme.noChanceBg;
    }
  }

  Color get badgeBorder {
    switch (this) {
      case PredictionLevel.safe:
        return AppTheme.safeBorder;
      case PredictionLevel.moderate:
        return AppTheme.moderateBorder;
      case PredictionLevel.dream:
        return AppTheme.dreamBorder;
      case PredictionLevel.noChance:
        return AppTheme.noChanceBorder;
    }
  }
}
