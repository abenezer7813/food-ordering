import 'package:dio/dio.dart';

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
      final response = await _dio.post('/auth/customer/register', data: {
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'password': password,
        'gender': gender,
        'device_token': 'deviceToken',
        "registration_method": "email",
      });
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Registration failed';
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/customer/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Login failed';
    }
  }
  Future<Map<String, dynamic>> verifyOtp({
  required String email,
  required String otp,
}) async {
  try {
    final response = await _dio.post('/auth/customer/verify', data: {
      'email': email,
      'otp': otp,
    });
    return response.data;
  } on DioException catch (e) {
    throw e.response?.data['message'] ?? 'Verification failed';
  }
}
Future<void> updateDeviceToken(String deviceToken) async {
  try {
    await _dio.patch('/auth/device-token', data: {
      'device_token': deviceToken,
    });
  } on DioException catch (e) {
    throw e.response?.data['message'] ?? 'Failed to update device token';
  }
}
}