import 'package:dio/dio.dart';
import '../models/order_model.dart';

class OrderService {
  final Dio _dio;

  OrderService(this._dio);

  Future<List<Order>> getMyOrders() async {
    try {
      final response = await _dio.get('/order/my-orders');
      final List data = response.data['orders'];
      return data.map((json) => Order.fromJson(json)).toList();
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? e.response?.data['message'] ?? 'Failed to fetch orders';
    }
  }
}