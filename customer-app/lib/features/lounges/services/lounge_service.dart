import 'package:dio/dio.dart';

class LoungeService {
  final Dio _dio;

  LoungeService(this._dio);

  Future<List<dynamic>> getLounges() async {
  try {
    final response = await _dio.get('/lounges');
    return response.data['lounges'];
  } on DioException catch (e) {
    throw e.response?.data['message'] ?? 'Failed to fetch lounges';
  }
}
}