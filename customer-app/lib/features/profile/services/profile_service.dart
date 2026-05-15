import 'package:dio/dio.dart';
import '../../../core/utils/cache_manager.dart';

class ProfileService {
  final Dio _dio;

  ProfileService(this._dio);

  Future<Map<String, dynamic>> getProfile() async {
    const cacheKey = 'profile';

    // Try cache first
    final cached = await CacheManager.get(cacheKey);
    if (cached != null) return cached as Map<String, dynamic>;

    // Fetch from API
    final response = await _dio.get('/auth/profile');
    final data = response.data['customer'] as Map<String, dynamic>;

    // Save to cache for 60 minutes
    await CacheManager.set(cacheKey, data, ttlMinutes: 60);

    return data;
  }
  
  Future<void> updateProfile({
  required String firstName,
  required String lastName,
  required String gender,
}) async {
  try {
    await _dio.patch('/auth/customer/profile', data: {
      'first_name': firstName,
      'last_name': lastName,
      'gender': gender,
    });
  } on DioException catch (e) {
    throw e.response?.data['message'] ?? 'Failed to update profile';
  }
}
  
}