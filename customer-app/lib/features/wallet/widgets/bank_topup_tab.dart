import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/app_colors.dart';
import '../../lounges/models/lounge_model.dart';
import '../providers/wallet_provider.dart';
import '../services/cloudinary_service.dart';

class BankTopUpTab extends ConsumerStatefulWidget {
  final Lounge lounge;

  const BankTopUpTab({super.key, required this.lounge});

  @override
  ConsumerState<BankTopUpTab> createState() => _BankTopUpTabState();
}

class _BankTopUpTabState extends ConsumerState<BankTopUpTab> {
  final _amountController = TextEditingController();
  File? _receiptImage;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _receiptImage = File(picked.path));
    }
  }

  Future<void> _submit() async {
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

    if (_receiptImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload a receipt image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Upload receipt to Cloudinary
      final receiptUrl = await CloudinaryService.uploadImage(_receiptImage!);

      // Submit top up request
      final walletService = ref.read(walletServiceProvider);
      await walletService.createTopUpRequest(
        loungeId: widget.lounge.id,
        amount: amount,
        paymentMethod: 'bank_transfer',
        receiptImageUrl: receiptUrl,
      );

      _amountController.clear();
      setState(() => _receiptImage = null);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Bank transfer request submitted! Awaiting approval.'),
            backgroundColor: AppColors.success,
          ),
        );
        // Refresh the requests list so the new request appears immediately
        ref.invalidate(myTopUpRequestsProvider(widget.lounge.id));
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Upload your bank transfer receipt and enter the amount.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
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
                hintText: 'Enter amount',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 15),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Receipt image picker
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              width: double.infinity,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.accent.withOpacity(0.3),
                  style: BorderStyle.solid,
                ),
              ),
              child: _receiptImage != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        _receiptImage!,
                        fit: BoxFit.cover,
                      ),
                    )
                  : const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.upload_file,
                            color: AppColors.accent, size: 30),
                        SizedBox(height: 8),
                        Text(
                          'Tap to upload receipt',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Submit Bank Transfer Request',
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