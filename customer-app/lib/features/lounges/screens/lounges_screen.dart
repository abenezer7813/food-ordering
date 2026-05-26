import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/cache_manager.dart';
import '../providers/lounge_provider.dart';
import '../../../shared/widgets/app_drawer.dart';
class LoungesScreen extends ConsumerWidget {
  const LoungesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final 
    loungesAsync = ref.watch(loungesProvider);

    return Scaffold(
      backgroundColor: AppColors.mainBg,
     appBar: AppBar(
  backgroundColor: AppColors.mainBg,
  elevation: 0.6,

  iconTheme: const IconThemeData(
    color: AppColors.appbarNav1,
  ),

  title: const Text(
    'Lounges',
    style: TextStyle(
      color: AppColors.textPrimary,
      fontWeight: FontWeight.bold,
    ),
  ),
), drawer: const AppDrawer(),
     bottomNavigationBar: Container(
  margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(24),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.08),
        blurRadius: 20,
        offset: const Offset(0, 6),
      ),
    ],
  ),

  child: ClipRRect(
    borderRadius: BorderRadius.circular(24),

    child: BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,

      currentIndex: 0,

      selectedItemColor: AppColors.accent,
      unselectedItemColor: AppColors.textSecondary,

      selectedLabelStyle: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 12,
      ),

      unselectedLabelStyle: const TextStyle(
        fontSize: 11,
      ),

      elevation: 0,

      onTap: (index) {

        if (index == 0) {
          context.go('/lounges');
        }

       

        if (index == 1) {
          context.go('/orders');
        }

        if (index == 2) {
          context.push('/history');
        }
      },

      items: const [

        BottomNavigationBarItem(
          icon: Icon(Icons.restaurant_rounded),
          activeIcon: Icon(Icons.restaurant_menu_rounded),
          label: 'Lounges',
        ),

       
        BottomNavigationBarItem(
          icon: Icon(Icons.receipt_long_outlined),
          activeIcon: Icon(Icons.receipt_long_rounded),
          label: 'Orders',
        ),

        BottomNavigationBarItem(
          icon: Icon(Icons.history_rounded),
          activeIcon: Icon(Icons.history_toggle_off_rounded),
          label: 'History',
        ),
      ],
    ),
  ),
),body: RefreshIndicator(
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
                    backgroundColor: AppColors.accent,
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
         data: (lounges) {
  // Sort lounges alphabetically
  lounges.sort(
    (a, b) => a.name.toLowerCase().compareTo(
      b.name.toLowerCase(),
    ),
  );

  return ListView.builder(
    padding: const EdgeInsets.all(16),
    itemCount: lounges.length,
    itemBuilder: (context, index) {
      final lounge = lounges[index];

      return GestureDetector(
        onTap: () => context.push(
          '/menu',
          extra: {
            'lounge': lounge,
            'isNonCafe': false,
          },
        ),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.textLight,
            borderRadius: BorderRadius.circular(10),
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
                child: const Icon(
                  Icons.restaurant,
                  color: AppColors.accent,
                ),
              ),

              const SizedBox(width: 16),

              Expanded(
                child: Text(
                  lounge.name[0].toUpperCase() +
                      lounge.name.substring(1),
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
  );
},
        ),
      ),
    );
  }
}