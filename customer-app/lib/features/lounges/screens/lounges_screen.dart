import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/lounge_provider.dart';
import '../../auth/providers/auth_provider.dart';

class LoungesScreen extends ConsumerWidget {
  const LoungesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loungesAsync = ref.watch(loungesProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: const Text(
          'Lounges',
          style: TextStyle(color: AppColors.textLight),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textLight),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
  currentIndex: 0, 
  selectedItemColor: AppColors.primaryBlue,
  unselectedItemColor: AppColors.textSecondary,
  onTap: (index) {
    if (index == 0) context.go('/lounges');
    if (index == 1) context.go('/orders');
    if (index == 2) context.push('/profile');
  },
  items: const [
    BottomNavigationBarItem(
      icon: Icon(Icons.restaurant),
      label: 'Lounges',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.receipt_long),
      label: 'My Orders',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Profile',
    ),
  ],
),
      body: loungesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text(
            error.toString(),
            style: const TextStyle(color: AppColors.error),
          ),
        ),
        data: (lounges) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: lounges.length,
          itemBuilder: (context, index) {
            final lounge = lounges[index];
            return GestureDetector(
              onTap: () => context.push('/order-type', extra: lounge),
              child: Container(
                margin: const EdgeInsets.only(bottom: 16),
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
                      child: const Icon(
                        Icons.restaurant,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        lounge.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
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
          },
        ),
      ),
    );
  }
}
