import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/cache_manager.dart';
import '../../lounges/models/lounge_model.dart';
import '../models/menu_item_model.dart';
import '../providers/menu_provider.dart';
import '../../lounges/providers/wallet_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
// Simple cart state
final cartProvider = StateProvider<Map<String, int>>((ref) => {});

class MenuScreen extends ConsumerWidget {
  final Lounge lounge;
  final bool isNonCafe;

  const MenuScreen({super.key, required this.lounge, required this.isNonCafe});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuAsync = ref.watch(menuItemsProvider(lounge.id));
    final cart = ref.watch(cartProvider);
    final totalItems = cart.values.fold(0, (sum, qty) => sum + qty);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: Text(
          lounge.name,
          style: const TextStyle(color: AppColors.textLight),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.account_balance_wallet,
              color: AppColors.textLight,
            ),
            onPressed: () async {
              final status = await ref.read(
                nonCafeStatusProvider(lounge.id).future,
              );
              if (status) {
                context.push('/wallet', extra: lounge);
              } else {
                if (context.mounted) {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Non-Café Registration'),
                      content: const Text(
                        'You need to register as a non-café customer to access the wallet. Would you like to register?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            context.push('/non-cafe-register', extra: lounge);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                          ),
                          child: const Text(
                            'Register',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  );
                }
              }
            },
          ),
          if (totalItems > 0)
            Stack(
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.shopping_cart,
                    color: AppColors.textLight,
                  ),
                  onPressed: () => context.push(
                    '/cart',
                    extra: {'lounge': lounge, 'isNonCafe': isNonCafe},
                  ),
                ),
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$totalItems',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          IconButton(
            icon: const Icon(Icons.receipt_long, color: AppColors.textLight),
            onPressed: () {
              context.push('/orders');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await CacheManager.remove('menu_${lounge.id}');
          ref.invalidate(menuItemsProvider(lounge.id));
          await ref.read(menuItemsProvider(lounge.id).future);
        },
        child: menuAsync.when(
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
                    ref.invalidate(menuItemsProvider(lounge.id));
                    ref.read(menuItemsProvider(lounge.id).future);
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
          data: (items) => Column(
            children: [
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.56,
                  ),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    final qty = cart[item.id] ?? 0;
                    return _MenuItemCard(item: item, qty: qty);
                  },
                ),
              ),
              // Bottom cart bar
              if (totalItems > 0)
                _CartBar(
                  totalItems: totalItems,
                  items: items,
                  cart: cart,
                  lounge: lounge,
                  isNonCafe: isNonCafe,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuItemCard extends ConsumerWidget {
  final MenuItem item;
  final int qty;

  const _MenuItemCard({required this.item, required this.qty});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.textLight,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image or placeholder
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: item.imageUrl != null
                ? CachedNetworkImage(
                    imageUrl: item.imageUrl!,
                    height: 110,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => _imagePlaceholder(),
                    errorWidget: (context, url, error) => _imagePlaceholder(),
                  )
                : _imagePlaceholder(),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.description != null)
                  Text(
                    item.description!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                const SizedBox(height: 4),
                Text(
                  'ETB ${item.price.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: AppColors.primaryBlue,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.timer,
                      size: 11,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      '${item.estimatedPreparationTime} min',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                // Add/Remove controls
                qty == 0
                    ? SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            ref
                                .read(cartProvider.notifier)
                                .update((cart) => {...cart, item.id: 1});
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: const Text(
                            'Add',
                            style: TextStyle(
                              color: AppColors.textLight,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () {
                              ref.read(cartProvider.notifier).update((cart) {
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
                              padding: const EdgeInsets.all(4),
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
                          Text(
                            '$qty',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.textPrimary,
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
                              padding: const EdgeInsets.all(4),
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 110,
      width: double.infinity,
      color: AppColors.primaryBlue.withOpacity(0.1),
      child: const Icon(
        Icons.restaurant,
        color: AppColors.primaryBlue,
        size: 40,
      ),
    );
  }
}

class _CartBar extends ConsumerWidget {
  final int totalItems;
  final List<MenuItem> items;
  final Map<String, int> cart;
  final Lounge lounge;
  final bool isNonCafe;

  const _CartBar({
    required this.totalItems,
    required this.items,
    required this.cart,
    required this.lounge,
    required this.isNonCafe,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalPrice = items.fold(0.0, (sum, item) {
      final qty = cart[item.id] ?? 0;
      return sum + (item.price * qty);
    });

    return GestureDetector(
      onTap: () => context.push(
        '/cart',
        extra: {'lounge': lounge, 'isNonCafe': isNonCafe},
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        color: AppColors.primaryBlue,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '$totalItems item${totalItems > 1 ? 's' : ''} in cart',
              style: const TextStyle(
                color: AppColors.textLight,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'ETB ${totalPrice.toStringAsFixed(2)}',
              style: const TextStyle(
                color: AppColors.textLight,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
