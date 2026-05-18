import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../models/lounge_model.dart';
import '../../wallet/services/wallet_service.dart';
import '../../../core/providers/core_providers.dart';
import '../../wallet/providers/wallet_provider.dart';
class NonCafeRegisterScreen extends ConsumerStatefulWidget {
  final Lounge lounge;
  const NonCafeRegisterScreen({super.key, required this.lounge});

  @override
  ConsumerState<NonCafeRegisterScreen> createState() =>
      _NonCafeRegisterScreenState();
}

class _NonCafeRegisterScreenState
    extends ConsumerState<NonCafeRegisterScreen> {
  bool _isLoading = false;
  String? _error;

  Future<void> _register() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final walletService = WalletService(ref.read(apiClientProvider).dio);
      await walletService.registerNonCafe(widget.lounge.id);
     if (mounted) {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('Successfully registered as non-café customer!'),
      backgroundColor: AppColors.success,
    ),
  );
  await Future.delayed(const Duration(seconds: 1));
  // Invalidate the status provider so it refreshes
  ref.invalidate(nonCafeStatusProvider(widget.lounge.id));
  context.pushReplacement('/wallet', extra: widget.lounge);
}
  } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: const Text(
          'Non-Café Registration',
          style: TextStyle(color: AppColors.textLight),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(25),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.account_balance_wallet,
                color: AppColors.accent,
                size: 60,
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'Register as Non-Café Customer',
              style: TextStyle(
                color: AppColors.textLight,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),
            const Text(
              'A wallet will be created for you. You can top up your balance and pay for orders without using Chapa.',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),
            Text(
              'Lounge: ${widget.lounge.name}',
              style: const TextStyle(
                color: AppColors.textLight,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 15),
              Text(
                _error!,
                style: const TextStyle(color: AppColors.error),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _register,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Register & Continue',
                        style: TextStyle(
                          color: AppColors.textLight,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 15),
            TextButton(
              onPressed: () => context.go('/lounges'),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}