import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../lounges/models/lounge_model.dart';
import '../models/order_model.dart';
import '../providers/order_provider.dart';

// Auto-refreshes every 30 seconds so the user sees live status updates
class LoungeOrdersScreen extends ConsumerStatefulWidget {
  final Lounge lounge;

  const LoungeOrdersScreen({super.key, required this.lounge});

  @override
  ConsumerState<LoungeOrdersScreen> createState() => _LoungeOrdersScreenState();
}

class _LoungeOrdersScreenState extends ConsumerState<LoungeOrdersScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Poll every 30 seconds
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      ref.invalidate(myOrdersProvider);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      backgroundColor: AppColors.mainBg,
      appBar: AppBar(
        backgroundColor: AppColors.accent,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'My Orders',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 17,
              ),
            ),
            Text(
              widget.lounge.name
                  .split(' ')
                  .map(
                    (w) => w.isEmpty ? w : w[0].toUpperCase() + w.substring(1),
                  )
                  .join(' '),
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              ref.invalidate(myOrdersProvider);
            },
          ),
        ],
      ),
      body: ordersAsync.when(
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
              const Text(
                'Could not load orders',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(myOrdersProvider),
                icon: const Icon(Icons.refresh, color: Colors.white),
                label: const Text(
                  'Retry',
                  style: TextStyle(color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
              ),
            ],
          ),
        ),
        data: (allOrders) {
          // Only show orders for this lounge that are not yet collected
          final activeOrders =
              allOrders
                  .where(
                    (o) =>
                        o.loungeId == widget.lounge.id &&
                        o.status != 'collected',
                  )
                  .toList()
                ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

          if (activeOrders.isEmpty) {
            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(myOrdersProvider);
                await ref.read(myOrdersProvider.future);
              },
              child: ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.accent.withValues(alpha: 0.08),
                            ),
                            child: Icon(
                              Icons.receipt_long_outlined,
                              size: 48,
                              color: AppColors.accent.withValues(alpha: 0.5),
                            ),
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'No active orders',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Your orders will appear here\nonce you place them.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 14,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(myOrdersProvider);
              await ref.read(myOrdersProvider.future);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: activeOrders.length,
              itemBuilder: (context, index) {
                final order = activeOrders[index];
                // Position = index + 1 among active orders sorted by time
                final position = index + 1;
                return _OrderQueueCard(
                  order: order,
                  position: position,
                  total: activeOrders.length,
                );
              },
            ),
          );
        },
      ),
    );
  }
}

// ── Order queue card ──────────────────────────────────────────────────────────

class _OrderQueueCard extends StatelessWidget {
  final Order order;
  final int position;
  final int total;

  const _OrderQueueCard({
    required this.order,
    required this.position,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final statusCfg = _statusConfig(order.status);

    return GestureDetector(
      onTap: () => context.push('/order-detail', extra: order),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: statusCfg.color.withValues(alpha: 0.12),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            // ── TOP: STATUS BAR ──────────────────────────────────────────
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: statusCfg.color.withValues(alpha: 0.08),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: statusCfg.color.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      statusCfg.icon,
                      color: statusCfg.color,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          statusCfg.label,
                          style: TextStyle(
                            color: statusCfg.color,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          statusCfg.description,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Queue position badge
                  if (order.status != 'ready')
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '#$position of $total',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Ready ✓',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // ── MIDDLE: ORDER INFO ───────────────────────────────────────
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Order #${order.id.substring(0, 8).toUpperCase()}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'ETB ${order.totalAmount.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          color: AppColors.accent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Items list (compact)
                  ...order.orderItems.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${item.quantity}× ${item.menuItemName}',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          Text(
                            'ETB ${(item.unitPrice * item.quantity).toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ── PROGRESS STEPPER ──────────────────────────────────
                  _MiniStepper(status: order.status),

                  const SizedBox(height: 12),

                  // Est. time + placed time
                  Row(
                    children: [
                      const Icon(
                        Icons.access_time_rounded,
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Est. ${order.estimatedReadyTime} min',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      const Icon(
                        Icons.calendar_today_outlined,
                        size: 12,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(order.createdAt),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ── BOTTOM: READY BANNER ─────────────────────────────────────
            if (order.status == 'ready')
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(20),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.check_circle_rounded,
                      color: Colors.white,
                      size: 18,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Your order is ready — come pick it up!',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final local = dt.toLocal();
    return '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }

  _StatusConfig _statusConfig(String status) {
    switch (status) {
      case 'confirmed':
        return _StatusConfig(
          color: AppColors.info,
          icon: Icons.check_circle_outline,
          label: 'Order Confirmed',
          description: 'Waiting to be prepared',
        );
      case 'preparing':
        return _StatusConfig(
          color: AppColors.preparingOrder,
          icon: Icons.soup_kitchen_outlined,
          label: 'Being Prepared',
          description: 'The kitchen is working on it',
        );
      case 'ready':
        return _StatusConfig(
          color: AppColors.success,
          icon: Icons.done_all_rounded,
          label: 'Ready for Pickup',
          description: 'Come collect your order now',
        );
      default: // pending
        return _StatusConfig(
          color: AppColors.warning,
          icon: Icons.hourglass_top_rounded,
          label: 'Pending',
          description: 'Waiting for confirmation',
        );
    }
  }
}

class _StatusConfig {
  final Color color;
  final IconData icon;
  final String label;
  final String description;
  const _StatusConfig({
    required this.color,
    required this.icon,
    required this.label,
    required this.description,
  });
}

// ── Mini progress stepper ─────────────────────────────────────────────────────

class _MiniStepper extends StatelessWidget {
  final String status;
  const _MiniStepper({required this.status});

  static const _steps = ['pending', 'confirmed', 'preparing', 'ready'];
  static const _labels = ['Placed', 'Confirmed', 'Preparing', 'Ready'];

  @override
  Widget build(BuildContext context) {
    final currentIndex = _steps.indexOf(status);

    return Row(
      children: List.generate(_steps.length * 2 - 1, (i) {
        if (i.isOdd) {
          final leftDone = i ~/ 2 <= currentIndex;
          return Expanded(
            child: Container(
              height: 2,
              color: leftDone ? AppColors.accent : AppColors.border,
            ),
          );
        }
        final idx = i ~/ 2;
        final done = idx <= currentIndex;
        final active = idx == currentIndex;
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: active ? 26 : 20,
              height: active ? 26 : 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done ? AppColors.accent : AppColors.border,
                boxShadow: active
                    ? [
                        BoxShadow(
                          color: AppColors.accent.withValues(alpha: 0.4),
                          blurRadius: 8,
                        ),
                      ]
                    : null,
              ),
              child: Icon(
                done ? Icons.check : Icons.circle,
                color: Colors.white,
                size: done ? 12 : 6,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _labels[idx],
              style: TextStyle(
                fontSize: 9,
                fontWeight: active ? FontWeight.w700 : FontWeight.normal,
                color: done ? AppColors.accent : AppColors.textSecondary,
              ),
            ),
          ],
        );
      }),
    );
  }
}
