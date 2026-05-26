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
      throw e.response?.data['error'] ??
          e.response?.data['message'] ??
          'Failed to fetch orders';
    }
  }

  Future<QueuePosition> getQueuePosition(String loungeId) async {
    try {
      final response = await _dio.get('/order/queue/$loungeId');
      return QueuePosition.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw e.response?.data['error'] ??
          e.response?.data['message'] ??
          'Failed to fetch queue';
    }
  }
}

class QueuePosition {
  final int ordersAhead;
  final bool hasActiveOrder;
  final String? myOrderId;
  final String? myOrderStatus;

  const QueuePosition({
    required this.ordersAhead,
    required this.hasActiveOrder,
    this.myOrderId,
    this.myOrderStatus,
  });

  factory QueuePosition.fromJson(Map<String, dynamic> json) {
    return QueuePosition(
      ordersAhead: (json['orders_ahead'] as num).toInt(),
      hasActiveOrder: json['has_active_order'] as bool,
      myOrderId: json['my_order_id'] as String?,
      myOrderStatus: json['my_order_status'] as String?,
    );
  }
}
