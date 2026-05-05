import 'package:dio/dio.dart';
import '../models/menu_item_model.dart';

class MenuService {
  final Dio _dio;

  MenuService(this._dio);

  Future<List<MenuItem>> getMenuItems(String loungeId) async {
    try {
      final response = await _dio.get('/menu/$loungeId');
      final List data = response.data['menuItems'];
      return data.map((json) => MenuItem.fromJson(json)).toList();
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to fetch menu';
    }
  }
}