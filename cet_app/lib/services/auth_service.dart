import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  static final AuthService _instance = AuthService._();
  factory AuthService() => _instance;

  AuthService._();

  GoogleSignIn? _googleSignIn;

  GoogleSignIn get _googleSignInInstance {
    _googleSignIn ??= _createGoogleSignIn();
    return _googleSignIn!;
  }

  GoogleSignIn _createGoogleSignIn() {
    if (kIsWeb) {
      throw Exception(
        'Google Sign-In is not configured for web. ' 
        'Set a valid web client ID or add a proper meta tag to web/index.html.',
      );
    }

    return GoogleSignIn(
      scopes: ['email', 'profile'],
    );
  }

  bool get isFirebaseInitialized => Firebase.apps.isNotEmpty;

  FirebaseAuth get _auth {
    if (!isFirebaseInitialized) {
      throw FirebaseException(
        plugin: 'firebase_core',
        code: 'no-app',
        message: 'Firebase has not been initialized.',
      );
    }
    return FirebaseAuth.instance;
  }

  /// Stream of auth state changes
  Stream<User?> get authStateChanges {
    if (!isFirebaseInitialized) {
      return Stream.value(null);
    }
    return _auth.authStateChanges();
  }

  /// Current user (null if not signed in)
  User? get currentUser => isFirebaseInitialized ? _auth.currentUser : null;

  /// Whether the user is signed in
  bool get isSignedIn => currentUser != null;

  /// Sign in with Google — the only sign-in method
  Future<UserCredential> signInWithGoogle() async {
    if (!isFirebaseInitialized) {
      throw Exception('Firebase is not initialized. Google Sign-In is unavailable.');
    }

    // Trigger the Google Sign-In flow
    final GoogleSignInAccount? googleUser = await _googleSignInInstance.signIn();

    if (googleUser == null) {
      // User cancelled the sign-in
      throw Exception('Sign in cancelled');
    }

    // Obtain the auth details from the request
    final GoogleSignInAuthentication googleAuth =
        await googleUser.authentication;

    // Create a new credential
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    // Sign in to Firebase with the credential
    return await _auth.signInWithCredential(credential);
  }

  /// Sign out
  Future<void> signOut() async {
    if (_googleSignIn != null) {
      await _googleSignIn!.signOut();
    }
    await _auth.signOut();
  }

  /// Get the display name of the current user
  String get displayName => currentUser?.displayName ?? 'User';

  /// Get the email of the current user
  String get email => currentUser?.email ?? '';

  /// Get the photo URL of the current user
  String? get photoUrl => currentUser?.photoURL;
}
