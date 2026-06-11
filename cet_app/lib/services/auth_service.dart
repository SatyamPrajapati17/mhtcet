import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  static final AuthService _instance = AuthService._();
  factory AuthService() => _instance;

  AuthService._();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Current user (null if not signed in)
  User? get currentUser => _auth.currentUser;

  /// Whether the user is signed in
  bool get isSignedIn => _auth.currentUser != null;

  /// Sign in with Google — the only sign-in method
  Future<UserCredential> signInWithGoogle() async {
    // Trigger the Google Sign-In flow
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

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
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  /// Get the display name of the current user
  String get displayName => currentUser?.displayName ?? 'User';

  /// Get the email of the current user
  String get email => currentUser?.email ?? '';

  /// Get the photo URL of the current user
  String? get photoUrl => currentUser?.photoURL;
}
