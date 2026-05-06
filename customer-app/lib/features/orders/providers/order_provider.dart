import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/order_model.dart';
import '../services/order_service.dart';

final orderServiceProvider = Provider<OrderService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return OrderService(dio);
});

final myOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final orderService = ref.watch(orderServiceProvider);
  return orderService.getMyOrders();
});