import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../lounges/models/lounge_model.dart';
import '../models/menu_item_model.dart';
import '../providers/menu_provider.dart';
import '../providers/favorites_provider.dart';
import '../../wallet/providers/wallet_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

// Simple cart state
final cartProvider = StateProvider<Map<String, int>>((ref) => {});

class MenuScreen extends ConsumerStatefulWidget {
  final Lounge lounge;
  final bool isNonCafe;

  const MenuScreen({super.key, required this.lounge, required this.isNonCafe});

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

            unselectedLabelStyle: const TextStyle(fontSize: 11),

            elevation: 0,

            onTap: (index) {
              // MENU
              if (index == 0) {}

              // FAVORITES
              if (index == 1) {
                context.push(
                  '/favorites',
                  extra: {
                    'lounge': widget.lounge,
                    'isNonCafe': widget.isNonCafe,
                  },
                );
              }

              // CART
              if (index == 2) {
                context.push('/orders');
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
          widget.lounge.name
              .split(' ')
              .map((w) => w.isEmpty ? w : w[0].toUpperCase() + w.substring(1))
              .join(' '),
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
                context.push('/wallet', extra: widget.lounge);
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

         ],
      ),
      body: menuAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),

        error: (e, _) => Center(child: Text(e.toString())),

        data: (items) {
          // DEFAULT FILTER
          List<MenuItem> filteredItems =
              items.where((item) {
                  final categoryMatch =
                      item.category.toLowerCase() == selectedCategory;

                  final typeMatch = selectedType == 'all'
                      ? true
                      : item.type.toLowerCase() == selectedType;

                  final searchMatch = item.name.toLowerCase().contains(
                    searchQuery,
                  );

                  return categoryMatch && typeMatch && searchMatch;
                }).toList()
                // SORT ALPHABETICALLY
                ..sort(
                  (a, b) =>
                      a.name.toLowerCase().compareTo(b.name.toLowerCase()),
                );

          // Build opposite-category items for the horizontal strip
          final oppositeCategory = selectedCategory == 'food'
              ? 'drink'
              : 'food';
          final oppositeItems = items
              .where((item) => item.category.toLowerCase() == oppositeCategory)
              .take(10)
              .toList();

          return CustomScrollView(
            slivers: [
              // ── STICKY: SEARCH + TOGGLE + TYPE CHIPS ──────────────────
              SliverPersistentHeader(
                pinned: true,
                delegate: _FilterHeaderDelegate(
                  searchQuery: searchQuery,
                  selectedCategory: selectedCategory,
                  selectedType: selectedType,
                  onSearchChanged: (v) =>
                      setState(() => searchQuery = v.toLowerCase()),
                  onCategoryChanged: (v) => setState(() {
                    selectedCategory = v;
                    selectedType = 'all';
                  }),
                  onTypeChanged: (v) => setState(() => selectedType = v),
                ),
              ),

              // ── SCROLLABLE: OPPOSITE CATEGORY STRIP ───────────────────
              if (oppositeItems.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          selectedCategory == 'food'
                              ? 'Also try our drinks'
                              : 'Also try our food',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          height: 140,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: oppositeItems.length,
                            itemBuilder: (context, index) {
                              final item = oppositeItems[index];
                              return TweenAnimationBuilder<Offset>(
                                duration: Duration(
                                  milliseconds: 400 + (index * 80),
                                ),
                                tween: Tween(
                                  begin: const Offset(1, 0),
                                  end: Offset.zero,
                                ),
                                curve: Curves.easeOutCubic,
                                builder: (context, offset, child) =>
                                    Transform.translate(
                                      offset: Offset(offset.dx * 80, 0),
                                      child: Opacity(
                                        opacity: 1 - offset.dx,
                                        child: child,
                                      ),
                                    ),
                                child: Container(
                                  width: 170,
                                  margin: const EdgeInsets.only(right: 12),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    color: Colors.white,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(
                                          alpha: 0.08,
                                        ),
                                        blurRadius: 10,
                                        offset: const Offset(0, 6),
                                      ),
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
                                                Colors.black.withValues(
                                                  alpha: 0.7,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          bottom: 10,
                                          left: 10,
                                          right: 10,
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
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
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),

              // ── MAIN GRID — scrolls with everything above ──
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 0.72,
                  ),
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final item = filteredItems[index];
                    final qty = cart[item.id] ?? 0;
                    return _MenuItemCard(
                      item: item,
                      qty: qty,
                      loungeId: widget.lounge.id,
                    );
                  }, childCount: filteredItems.length),
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

        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),

        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : Colors.white,

          borderRadius: BorderRadius.circular(20),
        ),

        child: Text(
          type[0].toUpperCase() + type.substring(1),

          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,

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
  final String loungeId;

  const _MenuItemCard({
    required this.item,
    required this.qty,
    required this.loungeId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withValues(alpha: 0.10),
            blurRadius: 18,
            spreadRadius: 0,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── IMAGE SECTION ──────────────────────────────
            SizedBox(
              height: 130,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // IMAGE
                  item.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: item.imageUrl!,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => _imagePlaceholder(),
                          errorWidget: (_, __, ___) => _imagePlaceholder(),
                        )
                      : _imagePlaceholder(),

                  // BOTTOM SCRIM — fades into white card below
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 48,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            Colors.white.withValues(alpha: 0.85),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),

                  // TOP-LEFT: FAVORITE BUTTON
                  Positioned(
                    top: 8,
                    left: 8,
                    child: _FavoriteButton(itemId: item.id, loungeId: loungeId),
                  ),

                  // TOP-RIGHT: CATEGORY PILL
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        item.type[0].toUpperCase() + item.type.substring(1),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),

                  // BOTTOM-RIGHT: PREP TIME BADGE
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.access_time_rounded,
                            size: 11,
                            color: AppColors.accent,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            '${item.estimatedPreparationTime}m',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── CONTENT SECTION ────────────────────────────
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // NAME
                    Text(
                      item.name[0].toUpperCase() +
                          item.name.substring(1).toLowerCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),

                    const SizedBox(height: 3),

                    // DESCRIPTION
                    Text(
                      item.description ?? 'Fresh and delicious',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        height: 1.3,
                      ),
                    ),

                    const Spacer(),

                    // THIN DIVIDER
                    Container(
                      height: 1,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.accent.withValues(alpha: 0.0),
                            AppColors.accent.withValues(alpha: 0.2),
                            AppColors.accent.withValues(alpha: 0.0),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // PRICE + ADD CONTROL
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // PRICE
                        RichText(
                          text: TextSpan(
                            children: [
                              const TextSpan(
                                text: 'ETB ',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.accent,
                                ),
                              ),
                              TextSpan(
                                text: item.price.toStringAsFixed(0),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.accent,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // ADD / QTY CONTROL
                        qty == 0
                            ? _AddButton(
                                onTap: () {
                                  ref
                                      .read(cartProvider.notifier)
                                      .update((cart) => {...cart, item.id: 1});
                                },
                              )
                            : _QtyControl(
                                qty: qty,
                                onMinus: () {
                                  ref.read(cartProvider.notifier).update((
                                    cart,
                                  ) {
                                    final u = Map<String, int>.from(cart);
                                    if (u[item.id] == 1) {
                                      u.remove(item.id);
                                    } else {
                                      u[item.id] = (u[item.id] ?? 1) - 1;
                                    }
                                    return u;
                                  });
                                },
                                onPlus: () {
                                  ref
                                      .read(cartProvider.notifier)
                                      .update(
                                        (cart) => {
                                          ...cart,
                                          item.id: (cart[item.id] ?? 0) + 1,
                                        },
                                      );
                                },
                              ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      color: AppColors.accent.withValues(alpha: 0.07),
      child: const Center(
        child: Icon(Icons.fastfood_rounded, size: 42, color: AppColors.accent),
      ),
    );
  }
}

// ── Add button ────────────────────────────────────────────────────────────────
class _AddButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.accent.withValues(alpha: 0.40),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(Icons.add, color: Colors.white, size: 20),
      ),
    );
  }
}

// ── Qty stepper ───────────────────────────────────────────────────────────────
class _QtyControl extends StatelessWidget {
  final int qty;
  final VoidCallback onMinus;
  final VoidCallback onPlus;
  const _QtyControl({
    required this.qty,
    required this.onMinus,
    required this.onPlus,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 34,
      decoration: BoxDecoration(
        color: AppColors.accent.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: 0.20),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // MINUS
          GestureDetector(
            onTap: onMinus,
            child: Container(
              width: 30,
              height: 34,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.horizontal(
                  left: Radius.circular(11),
                ),
              ),
              child: const Icon(
                Icons.remove,
                size: 14,
                color: AppColors.accent,
              ),
            ),
          ),
          // COUNT
          SizedBox(
            width: 26,
            child: Text(
              '$qty',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          // PLUS
          GestureDetector(
            onTap: onPlus,
            child: Container(
              width: 30,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius: const BorderRadius.horizontal(
                  right: Radius.circular(11),
                ),
              ),
              child: const Icon(Icons.add, size: 14, color: Colors.white),
            ),
          ),
        ],
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

// ── Animated favorite heart button ───────────────────────────────────────────
class _FavoriteButton extends ConsumerStatefulWidget {
  final String itemId;
  final String loungeId;

  const _FavoriteButton({required this.itemId, required this.loungeId});

  @override
  ConsumerState<_FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends ConsumerState<_FavoriteButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
      lowerBound: 0.75,
      upperBound: 1.0,
      value: 1.0,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onTap() async {
    await _controller.reverse();
    ref.read(favoritesProvider(widget.loungeId).notifier).toggle(widget.itemId);
    await _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    final isFav = ref
        .watch(favoritesProvider(widget.loungeId))
        .contains(widget.itemId);

    return GestureDetector(
      onTap: _onTap,
      child: ScaleTransition(
        scale: _controller,
        child: Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.9),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isFav ? Icons.favorite : Icons.favorite_border,
            size: 18,
            color: Colors.red,
          ),
        ),
      ),
    );
  }
}

// ── Sticky filter header delegate ────────────────────────────────────────────
// Height: search(48) + gap(12) + toggle(52) + gap(16) + chips(40) + padding(32)
// = 200px total

class _FilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final String searchQuery;
  final String selectedCategory;
  final String selectedType;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<String> onTypeChanged;

  const _FilterHeaderDelegate({
    required this.searchQuery,
    required this.selectedCategory,
    required this.selectedType,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.onTypeChanged,
  });

  static const double _height = 200.0;

  @override
  double get minExtent => _height;
  @override
  double get maxExtent => _height;

  @override
  bool shouldRebuild(_FilterHeaderDelegate old) =>
      old.searchQuery != searchQuery ||
      old.selectedCategory != selectedCategory ||
      old.selectedType != selectedType;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Material(
      color: AppColors.mainBg,
      elevation: overlapsContent ? 3 : 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // SEARCH BAR
            TextField(
              onChanged: onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search food...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 10),

            // FOOD / DRINK TOGGLE
            Container(
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent.withValues(alpha: 0.12),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // FOOD
                  Expanded(
                    child: GestureDetector(
                      onTap: () => onCategoryChanged('food'),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        curve: Curves.easeInOut,
                        height: double.infinity,
                        decoration: BoxDecoration(
                          color: selectedCategory == 'food'
                              ? AppColors.accent
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.restaurant_rounded,
                              size: 16,
                              color: selectedCategory == 'food'
                                  ? Colors.white
                                  : AppColors.textSecondary,
                            ),
                            const SizedBox(width: 6),
                            AnimatedDefaultTextStyle(
                              duration: const Duration(milliseconds: 220),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: selectedCategory == 'food'
                                    ? Colors.white
                                    : AppColors.textSecondary,
                              ),
                              child: const Text('Food'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // DRINK
                  Expanded(
                    child: GestureDetector(
                      onTap: () => onCategoryChanged('drink'),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        curve: Curves.easeInOut,
                        height: double.infinity,
                        decoration: BoxDecoration(
                          color: selectedCategory == 'drink'
                              ? AppColors.accent
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.local_drink_rounded,
                              size: 16,
                              color: selectedCategory == 'drink'
                                  ? Colors.white
                                  : AppColors.textSecondary,
                            ),
                            const SizedBox(width: 6),
                            AnimatedDefaultTextStyle(
                              duration: const Duration(milliseconds: 220),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: selectedCategory == 'drink'
                                    ? Colors.white
                                    : AppColors.textSecondary,
                              ),
                              child: const Text('Drink'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // TYPE CHIPS
            SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _chip('all'),
                  if (selectedCategory == 'food') ...[
                    _chip('breakfast'),
                    _chip('lunch'),
                    _chip('dinner'),
                    _chip('all_day'),
                  ],
                  if (selectedCategory == 'drink') ...[
                    _chip('juice'),
                    _chip('coffee'),
                    _chip('tea'),
                    _chip('soda'),
                    _chip('smoothie'),
                    _chip('water'),
                    _chip('other'),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chip(String type) {
    final isSelected = selectedType == type;
    return GestureDetector(
      onTap: () => onTypeChanged(type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.accent.withValues(alpha: 0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Text(
          type == 'all_day'
              ? 'All Day'
              : type[0].toUpperCase() + type.substring(1),
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
