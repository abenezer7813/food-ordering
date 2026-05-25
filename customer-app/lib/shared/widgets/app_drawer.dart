import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/profile/providers/profile_provider.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);

    return SafeArea(
      child: Drawer(
        child: Column(
          children: [
            profileAsync.when(
              loading: () => Container(
                width: double.infinity,
                color: AppColors.accent,
                padding: const EdgeInsets.all(16),
                child: const Center(
                  child: CircularProgressIndicator(
                    color: Colors.white,
                  ),
                ),
              ),

              error: (_, _) => Container(
                width: double.infinity,
                height: 150,
                color: AppColors.accent,
              ),

              data: (profile) => Container(
                width: double.infinity,
                color: AppColors.accent,
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
                          color: AppColors.accent,
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

            ListTile(
              leading: const Icon(
                Icons.edit,
                color: AppColors.accent,
              ),
              title: const Text('Edit Profile'),
              onTap: () {
                Navigator.pop(context);
                context.push('/edit-profile');
              },
            ),

            ListTile(
              leading: const Icon(
                Icons.lock_outline,
                color: AppColors.accent,
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
                color: AppColors.accent,
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
                color: AppColors.accent,
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
              leading: const Icon(
                Icons.logout,
                color: AppColors.error,
              ),
              title: const Text(
                'Logout',
                style: TextStyle(
                  color: AppColors.error,
                ),
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