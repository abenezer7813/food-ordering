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

  Future<Map<String, dynamic>> getWallet(String loungeId) async {
    try {
      final response = await _dio.get('/wallet/$loungeId');
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to fetch wallet';
    }
  }

  Future<Map<String, dynamic>> topUpWallet(String loungeId, double amount) async {
    try {
      final response = await _dio.post('/wallet/$loungeId/topup', data: {
        'amount': amount,
      });
      return {
        'payment_url': response.data['payment_url'],
        'tx_ref': response.data['tx_ref'],
      };
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to initiate top up';
    }
  }

  Future<void> verifyTopUp(String txRef) async {
    try {
      await _dio.post('/wallet/verify', data: {'tx_ref': txRef});
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Verification failed';
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

  Future<Map<String, dynamic>> createTopUpRequest({
    required String loungeId,
    required double amount,
    required String paymentMethod,
    String? receiptImageUrl,
  }) async {
    try {
      final response = await _dio.post('/wallet/$loungeId/topup-request', data: {
        'amount': amount,
        'payment_method': paymentMethod,
        if (receiptImageUrl != null) 'receipt_image_url': receiptImageUrl,
      });
      return response.data['request'];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to submit top up request';
    }
  }

  Future<List<dynamic>> getMyTopUpRequests(String loungeId) async {
    try {
      final response = await _dio.get('/wallet/$loungeId/topup-requests/my');
      return response.data['requests'];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to fetch requests';
    }
  }
}