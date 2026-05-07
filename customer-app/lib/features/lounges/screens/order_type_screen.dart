import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../models/lounge_model.dart';
import '../providers/wallet_provider.dart';

class OrderTypeScreen extends ConsumerWidget {
  final Lounge lounge;
  const OrderTypeScreen({super.key, required this.lounge});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: Text(
          lounge.name,
          style: const TextStyle(color: AppColors.textLight),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(25),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'How would you like to order?',
              style: TextStyle(
                color: AppColors.textLight,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),

            // Regular option
            _OrderTypeCard(
              icon: Icons.credit_card,
              title: 'Regular',
              subtitle: 'Browse menu and pay via Chapa',
              onTap: () => context.push('/menu', extra: {
                'lounge': lounge,
                'isNonCafe': false,
              }),
            ),
            const SizedBox(height: 20),

            // Non-cafe option
            _NonCafeCard(lounge: lounge, ref: ref),
          ],
        ),
      ),
    );
  }
}

class _OrderTypeCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OrderTypeCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.textLight,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primaryBlue),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: AppColors.textSecondary,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}

class _NonCafeCard extends ConsumerWidget {
  final Lounge lounge;
  final WidgetRef ref;

  const _NonCafeCard({required this.lounge, required this.ref});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(nonCafeStatusProvider(lounge.id));

    return GestureDetector(
      onTap: () {
        statusAsync.whenData((isNonCafe) {
          if (isNonCafe) {
            context.push('/menu', extra: {
              'lounge': lounge,
              'isNonCafe': true,
            });
          } else {
            context.push('/non-cafe-register', extra: lounge);
          }
        });
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.textLight,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.account_balance_wallet,
                  color: AppColors.accent),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Non-Café',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  statusAsync.when(
                    loading: () => const Text('Checking status...',
                        style: TextStyle(
                            fontSize: 13, color: AppColors.textSecondary)),
                    error: (e, _) => const Text('Tap to continue',
                        style: TextStyle(
                            fontSize: 13, color: AppColors.textSecondary)),
                    data: (isNonCafe) => Text(
                      isNonCafe
                          ? 'Pay from your wallet'
                          : 'Register as non-café customer',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: AppColors.textSecondary,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}