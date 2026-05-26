import 'package:dio/dio.dart';
import '../../../core/utils/cache_manager.dart';

class LoungeService {
  final Dio _dio;

  LoungeService(this._dio);

  Future<List<dynamic>> getLounges() async {
    try {
      const cacheKey = 'lounges';

      // Try cache first
      final cached = await CacheManager.get(cacheKey);
      if (cached != null) return cached as List;

      // Fetch from API
      final response = await _dio.get('/lounges');
      final List data = response.data['lounges'];

      // Save to cache for 30 minutes
      await CacheManager.set(cacheKey, data);

      return data;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to fetch lounges';
    }
  }
}