import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/cache_manager.dart';
import '../providers/lounge_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../features/profile/providers/profile_provider.dart';

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
        actions: [],
      ),
      drawer: _AppDrawer(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: AppColors.textSecondary,
        onTap: (index) {
          if (index == 0) context.go('/lounges');
          if (index == 1) context.go('/orders');
          if (index == 2) context.push('/history');
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
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await CacheManager.remove('lounges');
          ref.invalidate(loungesProvider);
          await ref.read(loungesProvider.future);
        },
        child: loungesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.wifi_off,
                  color: AppColors.textSecondary,
                  size: 60,
                ),
                const SizedBox(height: 16),
                const Text('No connection'),
                const SizedBox(height: 8),
                const Text('Check your internet and try again'),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    ref.invalidate(loungesProvider);
                    ref.read(loungesProvider.future);
                  },
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  label: const Text(
                    'Retry',
                    style: TextStyle(color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                ),
              ],
            ),
          ),
          data: (lounges) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: lounges.length,
            itemBuilder: (context, index) {
              final lounge = lounges[index];
              return GestureDetector(
                onTap: () => context.push(
                  '/menu',
                  extra: {'lounge': lounge, 'isNonCafe': false},
                ),
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
      ),
    );
  }
}

class _AppDrawer extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);

    return SafeArea(
      child: Drawer(
        child: Column(
          children: [
            // Custom header instead of DrawerHeader
            profileAsync.when(
              loading: () => Container(
                width: double.infinity,
                color: AppColors.primaryBlue,
                padding: const EdgeInsets.all(16),
                child: const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              ),

              error: (_, __) => Container(
                width: double.infinity,
                height: 150,
                color: AppColors.primaryBlue,
              ),

              data: (profile) => Container(
                width: double.infinity,
                color: AppColors.primaryBlue,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      child: Text(
                        '${profile['first_name'][0]}${profile['last_name'][0]}'
                            .toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.primaryBlue,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text(
                      '${profile['first_name']} ${profile['last_name']}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    Text(
                      profile['email'],
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Menu items
            ListTile(
              leading: const Icon(Icons.edit, color: AppColors.primaryBlue),
              title: const Text('Edit Profile'),
              onTap: () {
                Navigator.pop(context);
                context.push('/edit-profile');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.lock_outline,
                color: AppColors.primaryBlue,
              ),
              title: const Text('Change Password'),
              onTap: () {
                Navigator.pop(context);
                context.push('/change-password');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.help_outline,
                color: AppColors.primaryBlue,
              ),
              title: const Text('FAQ'),
              onTap: () {
                Navigator.pop(context);
                context.push('/faq');
              },
            ),

            ListTile(
              leading: const Icon(
                Icons.info_outline,
                color: AppColors.primaryBlue,
              ),
              title: const Text('About Us'),
              onTap: () {
                Navigator.pop(context);
                context.push('/about');
              },
            ),

            const Spacer(),

            const Divider(),

            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text(
                'Logout',
                style: TextStyle(color: AppColors.error),
              ),
              onTap: () async {
                Navigator.pop(context);

                await ref.read(authProvider.notifier).logout();

                if (context.mounted) {
                  context.go('/login');
                }
              },
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
