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
final updateProfileProvider = Provider<Future<void> Function({
  required String firstName,
  required String lastName,
  required String gender,
})>((ref) {
  final profileService = ref.watch(profileServiceProvider);
  return ({required firstName, required lastName, required gender}) =>
      profileService.updateProfile(
        firstName: firstName,
        lastName: lastName,
        gender: gender,
      );
});