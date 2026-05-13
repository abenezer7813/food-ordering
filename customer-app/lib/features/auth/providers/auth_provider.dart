import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../services/auth_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
// 1. Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return AuthService(dio);
});

// 2. State class
class AuthState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  AuthState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    bool? isSuccess,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

// 3. Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final Ref _ref;

  AuthNotifier(this._authService, this._ref) : super(AuthState());

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String gender,
    String? deviceToken,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _authService.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        gender: gender,
        deviceToken: deviceToken,
      );
      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> login({
  required String email,
  required String password,
}) async {
  state = state.copyWith(isLoading: true, error: null);
  try {
    final response = await _authService.login(email: email, password: password);
    final token = response['token'];
    await _ref.read(tokenStorageProvider).saveToken(token);


    final messaging = FirebaseMessaging.instance;
    final deviceToken = await messaging.getToken();
    if (deviceToken != null) {
      await _authService.updateDeviceToken(deviceToken);
    }

    state = state.copyWith(isLoading: false, isSuccess: true);
  } catch (e) {
    state = state.copyWith(isLoading: false, error: e.toString());
  }
}

  
  Future<void> verifyOtp({
  required String email,
  required String otp,
}) async {
  state = state.copyWith(isLoading: true, error: null);

  try {
    final response = await _authService.verifyOtp(
      email: email,
      otp: otp,
    );

    final token = response['token'];

    // SUCCESS
    if (token != null) {
      await _ref.read(tokenStorageProvider).saveToken(token);

      state = state.copyWith(
        isLoading: false,
        isSuccess: true,
        error: null,
      );
    } 
    // FAILED
    else {
      state = state.copyWith(
        isLoading: false,
        isSuccess: false,
        error: response['error'] ?? 'Invalid OTP',
      );
    }
  } catch (e) {
    state = state.copyWith(
      isLoading: false,
      isSuccess: false,
      error: e.toString(),
    );
  }
}
Future<void> logout() async {
  await _ref.read(tokenStorageProvider).deleteToken();
  state = AuthState();
}
Future<void> resendOtp({
  required String email,
}) async {
  state = state.copyWith(
    isLoading: true,
    error: null,
  );

  try {
    final response = await _authService.resendOtp(
      email: email,
    );

    state = state.copyWith(
      isLoading: false,
      error: null,
    );
  } catch (e) {
    state = state.copyWith(
      isLoading: false,
      error: e.toString(),
    );
  }
}
}

// 4. StateNotifierProvider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService, ref);
});
