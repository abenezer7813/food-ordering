import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../services/profile_service.dart';

final profileServiceProvider = Provider<ProfileService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return ProfileService(dio);
});

final profileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final profileService = ref.watch(profileServiceProvider);
  return profileService.getProfile();
});