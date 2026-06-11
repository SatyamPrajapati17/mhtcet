# Flutter ProGuard / R8 Rules
# Keep Flutter engine classes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep url_launcher classes
-keep class com.hadifler.url_launcher.** { *; }

# Keep generic model classes from being obfuscated
-keep class * implements java.io.Serializable { *; }
