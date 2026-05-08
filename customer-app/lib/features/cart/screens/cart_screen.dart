import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/core_providers.dart';
import '../../lounges/models/lounge_model.dart';
import '../../menu/models/menu_item_model.dart';
import '../../menu/providers/menu_provider.dart';
import '../../menu/screens/menu_screen.dart';
import 'dart:async';

class CartScreen extends ConsumerStatefulWidget {
  final Lounge lounge;
  final bool isNonCafe;

  const CartScreen({super.key, required this.lounge, required this.isNonCafe});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  bool _isLoading = false;

  Future<void> _placeOrder(List<MenuItem> menuItems) async {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(apiClientProvider).dio;

      final items = cart.entries.map((entry) {
        return {'menu_item_id': entry.key, 'quantity': entry.value};
      }).toList();

      final response = await dio.post(
        '/order',
        data: {
          'lounge_id': widget.lounge.id,
          'items': items,
          'payment_method': widget.isNonCafe ? 'wallet' : 'chapa',
        },
      );

      final paymentUrl = response.data['payment_url'];
      final txRef = response.data['tx_ref']; // capture tx_ref

      if (paymentUrl != null && txRef != null) {
        final uri = Uri.parse(paymentUrl);
        if (await canLaunchUrl(uri)) {
          ref.read(cartProvider.notifier).state = {};
          await launchUrl(uri, mode: LaunchMode.externalApplication);

          // Wait for user to return to app
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
                      backgroundColor: AppColors.primaryBlue,
                    ),
                    child: const Text(
                      'Yes, Verify',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            );

            if (confirmed == true) {
              setState(() => _isLoading = true);
              try {
                final verifyResponse = await dio.post(
                  '/payments/verify',
                  data: {'tx_ref': txRef},
                );
                print('SUCCESS: ${verifyResponse.data}');
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order placed successfully!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                  context.go('/lounges');
                }
              } on DioException catch (e) {
                final errorData = e.response?.data;
                final statusCode = e.response?.statusCode;
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error $statusCode: $errorData')),
                  );
                }
              }
            } else {
              // User cancelled — go back to lounges
              if (mounted) context.go('/lounges');
            }
          }
        }
      } else {
        ref.read(cartProvider.notifier).state = {};
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Order placed successfully!'),
              backgroundColor: AppColors.success,
            ),
          );
          context.go('/lounges');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final menuAsync = ref.watch(menuItemsProvider(widget.lounge.id));

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: const Text(
          'Your Cart',
          style: TextStyle(color: AppColors.textLight),
        ),
      ),
      body: menuAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (menuItems) {
          final cartItems = menuItems
              .where((item) => cart.containsKey(item.id))
              .toList();

          if (cartItems.isEmpty) {
            return const Center(
              child: Text(
                'Your cart is empty',
                style: TextStyle(color: AppColors.textLight, fontSize: 18),
              ),
            );
          }

          final totalPrice = cartItems.fold(0.0, (sum, item) {
            return sum + (item.price * (cart[item.id] ?? 0));
          });

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: cartItems.length,
                  itemBuilder: (context, index) {
                    final item = cartItems[index];
                    final qty = cart[item.id] ?? 0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.textLight,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          // Item info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                Text(
                                  'ETB ${item.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: AppColors.primaryBlue,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Qty controls
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () {
                                  ref.read(cartProvider.notifier).update((
                                    cart,
                                  ) {
                                    final updated = Map<String, int>.from(cart);
                                    if (updated[item.id] == 1) {
                                      updated.remove(item.id);
                                    } else {
                                      updated[item.id] =
                                          (updated[item.id] ?? 1) - 1;
                                    }
                                    return updated;
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryBlue,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.remove,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                ),
                                child: Text(
                                  '$qty',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  ref
                                      .read(cartProvider.notifier)
                                      .update(
                                        (cart) => {
                                          ...cart,
                                          item.id: (cart[item.id] ?? 0) + 1,
                                        },
                                      );
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryBlue,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.add,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          // Item total
                          const SizedBox(width: 12),
                          Text(
                            'ETB ${(item.price * qty).toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              // Bottom summary
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppColors.textLight,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'ETB ${totalPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : () => _placeOrder(menuItems),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryBlue,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : Text(
                                widget.isNonCafe
                                    ? 'Place Order (Wallet)'
                                    : 'Pay with Chapa',
                                style: const TextStyle(
                                  color: AppColors.textLight,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
