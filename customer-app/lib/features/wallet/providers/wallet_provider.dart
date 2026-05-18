import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../services/wallet_service.dart';

final walletServiceProvider = Provider<WalletService>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return WalletService(dio);
});

final nonCafeStatusProvider = FutureProvider.family<bool, String>((ref, loungeId) async {
  final walletService = ref.watch(walletServiceProvider);
  return walletService.checkNonCafeStatus(loungeId);
});

final walletProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, loungeId) async {
  final walletService = ref.watch(walletServiceProvider);
  return walletService.getWallet(loungeId);
});
final myTopUpRequestsProvider = FutureProvider.family<List<dynamic>, String>((ref, loungeId) async {
  final walletService = ref.watch(walletServiceProvider);
  return walletService.getMyTopUpRequests(loungeId);
});