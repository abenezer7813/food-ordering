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

class MenuScreen extends ConsumerStatefulWidget {
  final Lounge lounge;
  final bool isNonCafe;

  const MenuScreen({
    super.key,
    required this.lounge,
    required this.isNonCafe,
  });

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {

  String selectedCategory = 'food';
  String selectedType = 'all';
String searchQuery = '';
  @override
  Widget build(BuildContext context) {
    final menuAsync = ref.watch(menuItemsProvider(widget.lounge.id));
    final cart = ref.watch(cartProvider);
    final totalItems = cart.values.fold(0, (sum, qty) => sum + qty);

    return Scaffold(
  backgroundColor: AppColors.mainBg,

  // BEAUTIFUL FLOATING NAV BAR
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

          // MENU
          if (index == 0) {}

          // FAVORITES
          if (index == 1) {
            context.push('/favorites');
          }

          // CART
          if (index == 2) {
            context.push(
              '/orders',
              
            );
          }

          // ORDERS
          if (index == 3) {
            context.push('/history');
          }
        },

        items: const [

          // MENU
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu_outlined),
            activeIcon: Icon(Icons.restaurant_menu),
            label: 'Menu',
          ),

          // FAVORITES
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_border_rounded),
            activeIcon: Icon(Icons.favorite_rounded),
            label: 'Favorites',
          ),

          // CART
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long_rounded),
            label: 'Orders',
          ),

          // ORDERS
          BottomNavigationBarItem(
            icon: Icon(Icons.history_outlined),
            activeIcon: Icon(Icons.history_toggle_off_rounded),
            label: 'History',
          ),
        ],
      ),
    ),
  ),

  appBar: AppBar(
  backgroundColor: AppColors.mainBg,
  elevation: 1,

  title: Text(
    widget.lounge.name,
    style: const TextStyle(
      color: AppColors.textPrimary,
      fontWeight: FontWeight.bold,
    ),
  ),

  actions: [

    // WALLET BUTTON
    IconButton(
      icon: const Icon(
        Icons.account_balance_wallet,
        color: AppColors.textPrimary,
      ),

      onPressed: () async {

        final status = await ref.read(
          nonCafeStatusProvider(widget.lounge.id).future,
        );

        if (status) {

          context.push(
            '/wallet',
            extra: widget.lounge,
          );

        } else {

          if (context.mounted) {

            showDialog(
              context: context,

              builder: (context) => AlertDialog(
                title: const Text(
                  'Non-Café Registration',
                ),

                content: const Text(
                  'You need to register as a non-café customer to access the wallet. Would you like to register?',
                ),

                actions: [

                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },

                    child: const Text('Cancel'),
                  ),

                  ElevatedButton(
                    onPressed: () {

                      Navigator.pop(context);

                      context.push(
                        '/non-cafe-register',
                        extra: widget.lounge,
                      );
                    },

                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                    ),

                    child: const Text(
                      'Register',
                      style: TextStyle(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
        }
      },
    ),

    // CART BUTTON
    if (totalItems > 0)
      Stack(
        children: [

          IconButton(
            icon: const Icon(
              Icons.shopping_cart,
              color: AppColors.textPrimary,
            ),

            onPressed: () {

              context.push(
                '/cart',
                extra: {
                  'lounge': widget.lounge,
                  'isNonCafe': widget.isNonCafe,
                },
              );
            },
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

    // ORDERS BUTTON
    
  ],
),
      body: menuAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),

        error: (e, _) => Center(
          child: Text(e.toString()),
        ),

        data: (items) {

          // DEFAULT FILTER
      List<MenuItem> filteredItems = items.where((item) {

  final categoryMatch =
      item.category.toLowerCase() == selectedCategory;

  final typeMatch = selectedType == 'all'
      ? true
      : item.type.toLowerCase() == selectedType;

  final searchMatch =
      item.name.toLowerCase().contains(searchQuery);

  return categoryMatch &&
      typeMatch &&
      searchMatch;

}).toList()

  // SORT ALPHABETICALLY
  ..sort(
    (a, b) => a.name.toLowerCase().compareTo(
      b.name.toLowerCase(),
    ),
  );

          return Column(
            children: [

              // SEARCH + CATEGORY
             // SEARCH + CATEGORY
Padding(
  padding: const EdgeInsets.all(16),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [

      Row(
        children: [

          // SEARCH BAR
          Expanded(
            child: TextField(

              onChanged: (value) {
                setState(() {
                  searchQuery = value.toLowerCase();
                });
              },

              decoration: InputDecoration(
                hintText: 'Search food...',
                prefixIcon: const Icon(Icons.search),

                filled: true,
                fillColor: Colors.white,

                contentPadding:
                    const EdgeInsets.symmetric(
                  vertical: 0,
                ),

                border: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          const SizedBox(width: 10),

          // CATEGORY BUTTON
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                selectedCategory = value;
                selectedType = 'all';
              });
            },

            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 14,
              ),

              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius:
                    BorderRadius.circular(18),
              ),

              child: Row(
                children: [

                  Text(
                    selectedCategory
                        .toUpperCase(),

                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight:
                          FontWeight.bold,
                    ),
                  ),

                  const SizedBox(width: 5),

                  const Icon(
                    Icons.keyboard_arrow_down,
                    color: Colors.white,
                  ),
                ],
              ),
            ),

            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'food',
                child: Text('Food'),
              ),

              const PopupMenuItem(
                value: 'drink',
                child: Text('Drink'),
              ),
            ],
          ),
        ],
      ),

      const SizedBox(height: 16),

      // TYPE BUTTONS
      SizedBox(
        height: 40,

        child: ListView(
          scrollDirection: Axis.horizontal,

          children: [

            _typeButton('all'),

            if (selectedCategory == 'food') ...[
              _typeButton('breakfast'),
              _typeButton('lunch'),
              _typeButton('dinner'),
            ],

            if (selectedCategory == 'drink') ...[
              _typeButton('smoothy'),
              _typeButton('soda'),
              _typeButton('juice'),
              _typeButton('coffee'),
            ],
          ],
        ),
      ),

      const SizedBox(height: 20),

     
      SizedBox(
  height: 120,
  child: menuAsync.when(
    loading: () => const Center(child: CircularProgressIndicator()),
    error: (_, __) => const SizedBox(),
    data: (items) {
final oppositeCategory =
    selectedCategory == 'food' ? 'drink' : 'food';

final popularItems = items
    .where((item) => item.category.toLowerCase() == oppositeCategory)
    .take(10)
    .toList();

return SizedBox(
  height: 140,
  child: ListView.builder(
    scrollDirection: Axis.horizontal,
    itemCount: popularItems.length,
    itemBuilder: (context, index) {
      final item = popularItems[index];

      return TweenAnimationBuilder<Offset>(
        duration: Duration(milliseconds: 400 + (index * 80)),
        tween: Tween(begin: const Offset(1, 0), end: Offset.zero),
        curve: Curves.easeOutCubic,
        builder: (context, offset, child) {
          return Transform.translate(
            offset: Offset(offset.dx * 80, 0),
            child: Opacity(
              opacity: 1 - offset.dx,
              child: child,
            ),
          );
        },
        child: Container(
          width: 170,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, 6),
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              fit: StackFit.expand,
              children: [
                CachedNetworkImage(
                  imageUrl: item.imageUrl ?? '',
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.7),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 10,
                  left: 10,
                  right: 10,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        maxLines: 1,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'ETB ${item.price.toStringAsFixed(0)}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
);},
  ),
),
    ],
  ),
), // GRID
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),

                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 0.72,
                  ),

                  itemCount: filteredItems.length,

                  itemBuilder: (context, index) {

                    final item = filteredItems[index];
                    final qty = cart[item.id] ?? 0;

                    return _MenuItemCard(
                      item: item,
                      qty: qty,
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _typeButton(String type) {

    final isSelected = selectedType == type;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedType = type;
        });
      },

      child: Container(
        margin: const EdgeInsets.only(right: 10),

        padding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 10,
        ),

        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.accent
              : Colors.white,

          borderRadius: BorderRadius.circular(20),
        ),

        child: Text(
          type[0].toUpperCase() + type.substring(1),

          style: TextStyle(
            color: isSelected
                ? Colors.white
                : AppColors.textPrimary,

            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
class _MenuItemCard extends ConsumerWidget {
  final MenuItem item;
  final int qty;

  const _MenuItemCard({
    required this.item,
    required this.qty,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 15,
            spreadRadius: 2,
            offset: const Offset(0, 8),
          ),
        ],
      ),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // IMAGE SECTION
          Stack(
            children: [

              // IMAGE
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),

                child: item.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: item.imageUrl!,
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,

                        placeholder: (context, url) =>
                            _imagePlaceholder(),

                        errorWidget: (context, url, error) =>
                            _imagePlaceholder(),
                      )
                    : _imagePlaceholder(),
              ),

              // GRADIENT
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.05),
                        Colors.black.withOpacity(0.25),
                      ],
                    ),
                  ),
                ),
              ),

              // FAVORITE BUTTON
              Positioned(
                top: 10,
                left: 10,

                child: Container(
                  padding: const EdgeInsets.all(7),

                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    shape: BoxShape.circle,
                  ),

                  child: const Icon(
                    Icons.favorite_border,
                    size: 18,
                    color: Colors.red,
                  ),
                ),
              ),

              // TIME BADGE
              Positioned(
                bottom: 10,
                right: 10,

                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),

                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),

                  child: Row(
                    children: [

                      const Icon(
                        Icons.access_time_rounded,
                        size: 13,
                        color: AppColors.accent,
                      ),

                      const SizedBox(width: 4),

                      Text(
                        '${item.estimatedPreparationTime} min',

                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // CONTENT
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // FOOD NAME
                  Text(
  item.name[0].toUpperCase() +
      item.name.substring(1).toLowerCase(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,

                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),

                  const SizedBox(height: 5),

                  // DESCRIPTION
                  Text(
                    item.description ??
                        'Fresh and delicious meal',

                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,

                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),

                  const Spacer(),

                  // PRICE + BUTTON
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,

                    children: [

                      // PRICE
                      Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.start,

                        children: [

                          const Text(
                            'Price',

                            style: TextStyle(
                              fontSize: 11,
                              color:
                                  AppColors.textSecondary,
                            ),
                          ),

                          const SizedBox(height: 2),

                          Text(
                            'ETB ${item.price.toStringAsFixed(0)}',

                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.accent,
                            ),
                          ),
                        ],
                      ),

                      // BUTTONS
                      qty == 0

                          // ADD BUTTON
                          ? GestureDetector(
                              onTap: () {

                                ref
                                    .read(
                                      cartProvider.notifier,
                                    )
                                    .update(
                                      (cart) => {
                                        ...cart,
                                        item.id: 1,
                                      },
                                    );
                              },

                              child: Container(
                                padding:
                                    const EdgeInsets.all(12),

                                decoration: BoxDecoration(
                                  color:
                                      AppColors.accent,

                                  borderRadius:
                                      BorderRadius.circular(
                                          16),

                                  boxShadow: [
                                    BoxShadow(
                                      color:
                                          AppColors.accent
                                              .withOpacity(
                                                  0.35),

                                      blurRadius: 10,
                                      offset:
                                          const Offset(
                                              0, 4),
                                    ),
                                  ],
                                ),

                                child: const Icon(
                                  Icons.add,
                                  color: Colors.white,
                                  size: 22,
                                ),
                              ),
                            )

                          // QUANTITY CONTROLS
                          : Container(
                              padding:
                                  const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 6,
                              ),

                              decoration: BoxDecoration(
                                color:
                                    AppColors.accent
                                        .withOpacity(0.1),

                                borderRadius:
                                    BorderRadius.circular(
                                        16),
                              ),

                              child: Row(
                                children: [

                                  // MINUS
                                  GestureDetector(
                                    onTap: () {

                                      ref
                                          .read(
                                            cartProvider
                                                .notifier,
                                          )
                                          .update(
                                        (cart) {

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
                                        },
                                      );
                                    },

                                    child: Container(
                                      padding:
                                          const EdgeInsets
                                              .all(4),

                                      decoration:
                                          BoxDecoration(
                                        color:
                                            Colors.white,

                                        borderRadius:
                                            BorderRadius
                                                .circular(
                                                    10),
                                      ),

                                      child: const Icon(
                                        Icons.remove,
                                        size: 16,
                                        color:
                                            AppColors.accent,
                                      ),
                                    ),
                                  ),

                                  Padding(
                                    padding:
                                        const EdgeInsets
                                            .symmetric(
                                      horizontal: 10,
                                    ),

                                    child: Text(
                                      '$qty',

                                      style:
                                          const TextStyle(
                                        fontWeight:
                                            FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ),

                                  // PLUS
                                  GestureDetector(
                                    onTap: () {

                                      ref
                                          .read(
                                            cartProvider
                                                .notifier,
                                          )
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
                                              .all(4),

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
                                        Icons.add,
                                        size: 16,
                                        color:
                                            Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 120,
      width: double.infinity,

      decoration: BoxDecoration(
        color: AppColors.accent.withOpacity(0.08),
      ),

      child: const Center(
        child: Icon(
          Icons.fastfood_rounded,
          size: 45,
          color: AppColors.accent,
        ),
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
