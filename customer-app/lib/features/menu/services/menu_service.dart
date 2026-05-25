import 'package:dio/dio.dart';
import '../../../core/utils/cache_manager.dart';
import '../models/menu_item_model.dart';

class MenuService {
  final Dio _dio;

  MenuService(this._dio);

  Future<List<MenuItem>> getMenuItems(String loungeId) async {
    try {
      final cacheKey = 'menu_$loungeId';

      // Try cache first
      final cached = await CacheManager.get(cacheKey);
      if (cached != null) {
        return (cached as List)
            .map((json) => MenuItem.fromJson(json))
            .toList();
      }

      // Fetch from API
      final response = await _dio.get('/menu/$loungeId');
      final List data = response.data['menuItems'];

      // Save to cache for 30 minutes
      await CacheManager.set(cacheKey, data);

      return data.map((json) => MenuItem.fromJson(json)).toList();
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to fetch menu items';
    }
  }
}