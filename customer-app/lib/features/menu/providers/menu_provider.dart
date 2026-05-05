import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/menu_item_model.dart';
import '../services/menu_service.dart';

final menuServiceProvider = Provider<MenuService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return MenuService(dio);
});

final menuItemsProvider =
    FutureProvider.family<List<MenuItem>, String>((ref, loungeId) async {
  final menuService = ref.watch(menuServiceProvider);
  return menuService.getMenuItems(loungeId);
});