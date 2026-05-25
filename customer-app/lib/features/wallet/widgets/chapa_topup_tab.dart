import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';
import '../../../core/constants/app_colors.dart';
import '../../lounges/models/lounge_model.dart';
import '../providers/wallet_provider.dart';

class ChapaTopUpTab extends ConsumerStatefulWidget {
  final Lounge lounge;

  const ChapaTopUpTab({super.key, required this.lounge});

  @override
  ConsumerState<ChapaTopUpTab> createState() => _ChapaTopUpTabState();
}

class _ChapaTopUpTabState extends ConsumerState<ChapaTopUpTab> {
  final _amountController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _waitForAppFocus() async {
    final completer = Completer<void>();
    late final AppLifecycleListener listener;
    listener = AppLifecycleListener(
      onResume: () {
        if (!completer.isCompleted) {
          completer.complete();
          listener.dispose();
        }
      },
    );
    await completer.future;
  }

  Future<void> _topUp() async {
    final amountText = _amountController.text.trim();
    if (amountText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an amount')),
      );
      return;
    }

    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final walletService = ref.read(walletServiceProvider);
      final result = await walletService.topUpWallet(widget.lounge.id, amount);

      final paymentUrl = result['payment_url'];
      final txRef = result['tx_ref'];

      final uri = Uri.parse(paymentUrl);
      if (await canLaunchUrl(uri)) {
        _amountController.clear();
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        await _waitForAppFocus();

        if (mounted) {
          final confirmed = await showDialog<bool>(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: const Text('Payment Completed?'),
              content: const Text('Did you complete the payment on Chapa?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('No, Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                  ),
                  child: const Text('Yes, Verify',
                      style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          );

          if (confirmed == true) {
            setState(() => _isLoading = true);
            await walletService.verifyTopUp(txRef);
            ref.invalidate(walletProvider(widget.lounge.id));
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Wallet topped up successfully!'),
                  backgroundColor: AppColors.success,
                ),
              );
            }
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [50, 100, 200, 500].map((amount) {
              return GestureDetector(
                onTap: () => _amountController.text = amount.toString(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                  ),
                  child: Text(
                    'ETB $amount',
                    style: const TextStyle(
                      color: AppColors.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(30),
            ),
            child: TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.attach_money, color: AppColors.accent),
                hintText: 'Enter custom amount',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 15),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _topUp,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Top Up via Chapa',
                      style: TextStyle(
                          color: AppColors.textLight,
                          fontSize: 16,
                          fontWeight: FontWeight.bold),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}