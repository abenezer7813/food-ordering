import 'package:dio/dio.dart';

class WalletService {
  final Dio _dio;

  WalletService(this._dio);

  Future<bool> checkNonCafeStatus(String loungeId) async {
    try {
      final response = await _dio.get(
        '/wallet/customers/non-cafe/status',
        queryParameters: {'lounge_id': loungeId},
      );
      return response.data['is_non_cafe'];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to check status';
    }
  }
  Future<Map<String, dynamic>> registerNonCafe(String loungeId) async {
  try {
    final response = await _dio.post('/wallet/register', data: {
      'lounge_id': loungeId,
    });
    return response.data['wallet'];
  } on DioException catch (e) {
    throw e.response?.data['message'] ?? 'Failed to register as non-café';
  }
}
}