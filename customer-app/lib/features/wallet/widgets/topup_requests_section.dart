import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/wallet_provider.dart';

// Real status values from backend topUpStatusEnum:
//   'pending' | 'cashier_approved' | 'manager_approved' | 'rejected'
//
// Cash flow:    pending → cashier_approved (wallet credited immediately)
// Bank flow:    pending → cashier_approved → manager_approved (wallet credited)

class TopUpRequestsSection extends ConsumerWidget {
  final String loungeId;

  const TopUpRequestsSection({super.key, required this.loungeId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(myTopUpRequestsProvider(loungeId));

    return requestsAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => const SizedBox.shrink(),
      data: (requests) {
        if (requests.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Top-Up Requests',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () =>
                      ref.invalidate(myTopUpRequestsProvider(loungeId)),
                  child: const Icon(
                    Icons.refresh,
                    color: AppColors.accent,
                    size: 20,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...requests.map((r) => _RequestCard(request: r)),
          ],
        );
      },
    );
  }
}

// ── Request card ──────────────────────────────────────────────────────────────

class _RequestCard extends StatelessWidget {
  final dynamic request;

  const _RequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final status = (request['status'] ?? 'pending').toString();
    final method = (request['payment_method'] ?? '').toString();
    final amount = double.tryParse(request['amount'].toString()) ?? 0.0;
    final createdAt = request['created_at'] != null
        ? _formatDate(request['created_at'].toString())
        : '';
    final rejectionReason = request['rejection_reason']?.toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: method icon + label + status badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _methodIcon(method),
                      color: AppColors.accent,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _methodLabel(method),
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                _StatusBadge(status: status),
              ],
            ),
            const SizedBox(height: 8),
            // Amount + date
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'ETB ${amount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  createdAt,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Progress stepper — steps differ by payment method
            _ApprovalStepper(status: status, method: method),
            // Rejection reason box
            if (status == 'rejected' && rejectionReason != null)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.info_outline,
                        color: AppColors.error,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          rejectionReason,
                          style: const TextStyle(
                            color: AppColors.error,
                            fontSize: 12,
                          ),
                        ),
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

  IconData _methodIcon(String method) {
    switch (method) {
      case 'bank_transfer':
        return Icons.account_balance;
      case 'cash':
        return Icons.payments_outlined;
      default:
        return Icons.wallet;
    }
  }

  String _methodLabel(String method) {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  }

  String _formatDate(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}  '
          '${dt.hour.toString().padLeft(2, '0')}:'
          '${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }
}

// ── Status badge ──────────────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final cfg = _config(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cfg.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(cfg.icon, color: cfg.color, size: 12),
          const SizedBox(width: 4),
          Text(
            cfg.label,
            style: TextStyle(
              color: cfg.color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  _BadgeConfig _config(String status) {
    switch (status) {
      case 'manager_approved':
        return _BadgeConfig(AppColors.success, Icons.check_circle, 'Approved');
      case 'cashier_approved':
        return _BadgeConfig(
          AppColors.info,
          Icons.verified_outlined,
          'Cashier Approved',
        );
      case 'rejected':
        return _BadgeConfig(AppColors.error, Icons.cancel, 'Rejected');
      default: // pending
        return _BadgeConfig(AppColors.warning, Icons.hourglass_top, 'Pending');
    }
  }
}

class _BadgeConfig {
  final Color color;
  final IconData icon;
  final String label;
  const _BadgeConfig(this.color, this.icon, this.label);
}

// ── Approval progress stepper ─────────────────────────────────────────────────
//
// Cash:  [Submitted] ──── [Cashier Review] ──── [Approved ✓]
//         (pending)       (pending→done)         (cashier_approved)
//
// Bank:  [Submitted] ──── [Cashier Review] ──── [Manager Review] ──── [Approved ✓]
//         (pending)       (cashier_approved)     (cashier_approved)    (manager_approved)

class _ApprovalStepper extends StatelessWidget {
  final String status;
  final String method;

  const _ApprovalStepper({required this.status, required this.method});

  @override
  Widget build(BuildContext context) {
    final isRejected = status == 'rejected';
    final isCashierApproved =
        status == 'cashier_approved' || status == 'manager_approved';
    final isManagerApproved = status == 'manager_approved';
    final isCash = method == 'cash';

    List<_StepData> steps;

    if (isCash) {
      // Cash: 3 steps — cashier approves and wallet is credited immediately
      steps = [
        _StepData(label: 'Submitted', state: _StepState.done),
        _StepData(
          label: 'Cashier\nReview',
          state: isRejected
              ? _StepState.rejected
              : isCashierApproved
              ? _StepState.done
              : _StepState.active,
        ),
        _StepData(
          label: 'Approved',
          state: isRejected
              ? _StepState.rejected
              : isCashierApproved
              ? _StepState.done
              : _StepState.waiting,
        ),
      ];
    } else {
      // Bank transfer: 4 steps — cashier then manager
      steps = [
        _StepData(label: 'Submitted', state: _StepState.done),
        _StepData(
          label: 'Cashier\nReview',
          state: isRejected
              ? _StepState.rejected
              : isCashierApproved
              ? _StepState.done
              : _StepState.active,
        ),
        _StepData(
          label: 'Manager\nReview',
          state: isRejected
              ? _StepState.rejected
              : isManagerApproved
              ? _StepState.done
              : isCashierApproved
              ? _StepState.active
              : _StepState.waiting,
        ),
        _StepData(
          label: 'Approved',
          state: isRejected
              ? _StepState.rejected
              : isManagerApproved
              ? _StepState.done
              : _StepState.waiting,
        ),
      ];
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(steps.length * 2 - 1, (i) {
        if (i.isOdd) {
          // Connector line between dots
          final leftDone = steps[i ~/ 2].state == _StepState.done;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 13),
              child: Container(
                height: 2,
                color: leftDone ? AppColors.accent : AppColors.border,
              ),
            ),
          );
        }
        return _StepDot(data: steps[i ~/ 2]);
      }),
    );
  }
}

enum _StepState { done, active, waiting, rejected }

class _StepData {
  final String label;
  final _StepState state;
  const _StepData({required this.label, required this.state});
}

class _StepDot extends StatelessWidget {
  final _StepData data;

  const _StepDot({required this.data});

  Color get _color {
    switch (data.state) {
      case _StepState.done:
        return AppColors.success;
      case _StepState.active:
        return AppColors.warning;
      case _StepState.rejected:
        return AppColors.error;
      case _StepState.waiting:
        return AppColors.border;
    }
  }

  IconData get _icon {
    switch (data.state) {
      case _StepState.done:
        return Icons.check;
      case _StepState.active:
        return Icons.hourglass_top;
      case _StepState.rejected:
        return Icons.close;
      case _StepState.waiting:
        return Icons.circle_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(shape: BoxShape.circle, color: _color),
          child: Icon(_icon, color: Colors.white, size: 14),
        ),
        const SizedBox(height: 4),
        Text(
          data.label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: data.state == _StepState.waiting
                ? AppColors.textSecondary
                : _color,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
