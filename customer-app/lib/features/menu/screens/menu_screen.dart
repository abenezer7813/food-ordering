import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/cache_manager.dart';
import '../../lounges/models/lounge_model.dart';
import '../models/menu_item_model.dart';
import '../providers/menu_provider.dart';
import '../../wallet/providers/wallet_provider.dart';
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
      backgroundColor: AppColors.mainBg,
      appBar: AppBar(
        backgroundColor: AppColors.mainBg,
        elevation: 1,
        title: Text(
          lounge.name,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.account_balance_wallet,
              color: AppColors.textPrimary,
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
                            backgroundColor: AppColors.accent,
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
          data: (items) => Column(
            children: [
              Padding(
  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row( 
        children: [
          Expanded(
            child: TextField(
              controller: TextEditingController(),
              decoration: InputDecoration(
                hintText: 'Search foodt...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        ]),
        //Search bar
      

      // TITLE
      Text(
        'Popular Menu',
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),

      const SizedBox(height: 6),

      Text(
        'Choose your favorite meals',
        style: TextStyle(
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
      ),
      const SizedBox(height: 18),
     ],
  ),
),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 0.53,
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
    borderRadius: BorderRadius.circular(20),
    boxShadow: [
  BoxShadow(
    color: Colors.black.withOpacity(0.2),
    blurRadius: 10,
    spreadRadius: 1,
    offset: const Offset(0, 8),
  ),
],
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    mainAxisSize: MainAxisSize.min,
    children: [

      // IMAGE
      ClipRRect(
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(20),
        ),
        child: item.imageUrl != null
            ? CachedNetworkImage(
                imageUrl: item.imageUrl!,
                height: 110,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) =>
                    _imagePlaceholder(),
                errorWidget: (context, url, error) =>
                    _imagePlaceholder(),
              )
            : _imagePlaceholder(),
      ),

      // CONTENT
      Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [

            // NAME
            Text(
              item.name,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: 4),

            // DESCRIPTION
            SizedBox(
              height: 34,
              child: Text(
                item.description ??
                    'Fresh and delicious meal',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),

            const SizedBox(height: 7),

            // PRICE + TIME
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
              children: [

                // PRICE
                Container(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.accent
                        .withOpacity(0.1),
                    borderRadius:
                        BorderRadius.circular(10),
                  ),
                  child: Text(
                    'ETB ${item.price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight:
                          FontWeight.bold,
                      fontSize: 13,
                      color: AppColors.accent,
                    ),
                  ),
                ),

                // TIME
                Row(
                  children: [
                    const Icon(
                      Icons.access_time_rounded,
                      size: 14,
                      color:
                          AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${item.estimatedPreparationTime} min',
                      style: const TextStyle(
                        fontSize: 11,
                        color:
                            AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 12),

            // BUTTONS
            qty == 0

                // ADD BUTTON
                ? SizedBox(
                    width: double.infinity,
                    height: 42,
                    child: ElevatedButton(
                      onPressed: () {
                        ref
                            .read(
                                cartProvider.notifier)
                            .update(
                              (cart) => {
                                ...cart,
                                item.id: 1,
                              },
                            );
                      },
                      style:
                          ElevatedButton.styleFrom(
                        elevation: 0,
                        backgroundColor:
                            AppColors.accent,
                        shape:
                            RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(
                                  14),
                        ),
                      ),
                      child: const Text(
                        'Add to Cart',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight:
                              FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  )

                // QUANTITY CONTROLS
                : Container(
                    height: 42,
                    padding:
                        const EdgeInsets.symmetric(
                      horizontal: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius:
                          BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment:
                          MainAxisAlignment
                              .spaceBetween,
                      children: [

                        // MINUS
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(
                                    cartProvider.notifier)
                                .update((cart) {
                              final updated =
                                  Map<String,
                                      int>.from(
                                cart,
                              );

                              if (updated[
                                      item.id] ==
                                  1) {
                                updated.remove(
                                    item.id);
                              } else {
                                updated[item.id] =
                                    (updated[item.id] ??
                                            1) -
                                        1;
                              }

                              return updated;
                            });
                          },
                          child: Container(
                            padding:
                                const EdgeInsets
                                    .all(6),
                            decoration:
                                BoxDecoration(
                              color:
                                  AppColors.accent,
                              borderRadius:
                                  BorderRadius
                                      .circular(
                                          10),
                            ),
                            child: const Icon(
                              Icons.remove_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),

                        // QTY
                        Text(
                          '$qty',
                          style: const TextStyle(
                            fontWeight:
                                FontWeight.bold,
                            fontSize: 16,
                            color: AppColors
                                .textPrimary,
                          ),
                        ),

                        // PLUS
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(
                                    cartProvider.notifier)
                                .update(
                                  (cart) => {
                                    ...cart,
                                    item.id:
                                        (cart[item.id] ??
                                                0) +
                                            1,
                                  },
                                );
                          },
                          child: Container(
                            padding:
                                const EdgeInsets
                                    .all(6),
                            decoration:
                                BoxDecoration(
                              color:
                                  AppColors.accent,
                              borderRadius:
                                  BorderRadius
                                      .circular(
                                          10),
                            ),
                            child: const Icon(
                              Icons.add_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ],
        ),
      ),
    ],
  ),
); }

  Widget _imagePlaceholder() {
    return Container(
      height: 110,
      width: double.infinity,
      color: AppColors.accent.withOpacity(0.1),
      child: const Icon(Icons.restaurant, color: AppColors.accent, size: 40),
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
        color: AppColors.accent,
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
