import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../lounges/models/lounge_model.dart';
import '../providers/wallet_provider.dart';
import '../widgets/chapa_topup_tab.dart';
import '../widgets/cash_topup_tab.dart';
import '../widgets/bank_topup_tab.dart';

class WalletScreen extends ConsumerWidget {
  final Lounge lounge;

  const WalletScreen({super.key, required this.lounge});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider(lounge.id));

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.accent,
        title: const Text(
          'My Wallet',
          style: TextStyle(color: AppColors.textLight),
        ),
      ),
      body: walletAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.wifi_off, color: AppColors.textSecondary, size: 60),
              const SizedBox(height: 16),
              const Text('No connection',
                  style: TextStyle(color: AppColors.textLight, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Check your internet and try again',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  ref.invalidate(walletProvider(lounge.id));
                  ref.read(walletProvider(lounge.id).future);
                },
                icon: const Icon(Icons.refresh, color: Colors.white),
                label: const Text('Retry', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
              ),
            ],
          ),
        ),
        data: (wallet) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(walletProvider(lounge.id));
            await ref.read(walletProvider(lounge.id).future);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Balance card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(30),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Current Balance',
                        style: TextStyle(color: AppColors.textLight, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'ETB ${double.parse(wallet['balance'].toString()).toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        lounge.name,
                        style: const TextStyle(color: AppColors.textLight, fontSize: 14),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Top up section with tabs
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.textLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: DefaultTabController(
                    length: 3,
                    child: Column(
                      children: [
                        TabBar(
                          labelColor: AppColors.accent,
                          unselectedLabelColor: AppColors.textSecondary,
                          indicatorColor: AppColors.accent,
                          tabs: const [
                            Tab(text: 'Chapa'),
                            Tab(text: 'Cash'),
                            Tab(text: 'Bank'),
                          ],
                        ),
                        SizedBox(
                          height: 320,
                          child: TabBarView(
                            children: [
                              ChapaTopUpTab(lounge: lounge),
                              CashTopUpTab(lounge: lounge),
                              BankTopUpTab(lounge: lounge),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}