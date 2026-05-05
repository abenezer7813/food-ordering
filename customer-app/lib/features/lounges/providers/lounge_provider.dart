import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/lounge_model.dart';
import '../services/lounge_service.dart';

final loungeServiceProvider = Provider<LoungeService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return LoungeService(dio);
});

final loungesProvider = FutureProvider<List<Lounge>>((ref) async {
  final loungeService = ref.watch(loungeServiceProvider);
  final data = await loungeService.getLounges();
  return data.map((json) => Lounge.fromJson(json)).toList();
});