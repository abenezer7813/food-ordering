import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String gender,
    String? deviceToken,
  }) async {
    try {
      final payload = {
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'password': password,
        'gender': gender,
        'device_token': deviceToken,
        "registration_method": "email",
      };

      print('=== REGISTER PAYLOAD ===');
      print(payload);

      final response = await _dio.post(
        '/auth/customer/register',
        data: payload,
      );

      print('=== REGISTER RESPONSE ===');
      print(response.statusCode);
      print(response.data);

      return response.data;
    } on DioException catch (e) {
      print('=== DIO ERROR ===');
      print('Status code: ${e.response?.statusCode}');
      print('Response data: ${e.response?.data}');
      print('Error message: ${e.message}');
      print('Error type: ${e.type}');
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Registration failed';
    } catch (e) {
      print('=== UNKNOWN ERROR ===');
      print(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/customer/login',
        data: {'email': email, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Login failed';
    }
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/customer/verify',
        data: {'email': email, 'otp': otp},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Verification failed';
    }
  }

  Future<void> updateDeviceToken(String deviceToken) async {
    try {
      await _dio.patch(
        '/auth/device-token',
        data: {'device_token': deviceToken},
      );
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to update device token';
    }
  }

  Future<Map<String, dynamic>> resendOtp({required String email}) async {
    final response = await _dio.post(
      '/auth/customer/resend-otp',
      data: {'email': email},
    );

    return response.data['message'];
  }

  Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final response = await _dio.post(
        '/auth/customer/forgot-password',
        data: {'email': email},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to send OTP';
    }
  }

  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/customer/reset-password',
        data: {'email': email, 'otp': otp, 'new_password': newPassword},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Password reset failed';
    }
  }

  Future<Map<String, dynamic>> changePassword({
    required String newPassword,
  }) async {
    try {
      final response = await _dio.patch(
        '/auth/customer/change-password',
        data: {'new_password': newPassword},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to change password';
    }
  }

  Future<Map<String, dynamic>> googleSignIn({String? deviceToken}) async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        serverClientId:
            '69649315678-rt6r8vetl6shv3r6g5mjhfuho0hfu0f1.apps.googleusercontent.com',
      );
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) throw 'Google sign in cancelled';

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final String? idToken = googleAuth.idToken;
      if (idToken == null) throw 'Failed to get Google token';

      final response = await _dio.post(
        '/auth/customer/google',
        data: {'idToken': idToken, 'device_token': deviceToken},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Google sign in failed';
    }
  }
}
