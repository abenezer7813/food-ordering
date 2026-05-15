import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  static const List<Map<String, String>> _faqs = [
    {
      'question': 'How do I place an order?',
      'answer':
          'Select a lounge from the home screen, browse the menu, add items to your cart, and proceed to checkout. You can pay using Chapa or your wallet.',
    },
    {
      'question': 'What is a non-café customer?',
      'answer':
          'A non-café customer is a registered customer who pays using a pre-loaded wallet instead of Chapa. You can register as a non-café customer from the menu screen.',
    },
    {
      'question': 'How do I top up my wallet?',
      'answer':
          'Tap the wallet icon on the menu screen, enter the amount you want to top up, and complete the payment via Chapa. Your balance will be updated automatically.',
    },
    {
      'question': 'How do I track my order?',
      'answer':
          'Go to My Orders from the bottom navigation bar. You can see the status of your active orders — pending, confirmed, preparing, and ready.',
    },
    {
      'question': 'When will my order be ready?',
      'answer':
          'Each order has an estimated ready time shown in the order detail screen. You will also receive a push notification when your order is ready for collection.',
    },
    {
      'question': 'How do I leave feedback?',
      'answer':
          'After your order is collected, open the order from Order History and tap the Leave Feedback button to rate your experience.',
    },
    {
      'question': 'Can I cancel my order?',
      'answer':
          'Currently, orders cannot be cancelled once placed. Please contact the lounge staff directly if you need assistance.',
    },
    {
      'question': 'What payment methods are supported?',
      'answer':
          'We support Chapa for online payments and wallet payments for registered non-café customers.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        title: const Text(
          'FAQ',
          style: TextStyle(color: AppColors.textLight),
        ),
        iconTheme: const IconThemeData(color: AppColors.textLight),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _faqs.length,
        itemBuilder: (context, index) {
          final faq = _faqs[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: AppColors.textLight,
              borderRadius: BorderRadius.circular(16),
            ),
            child: ExpansionTile(
              tilePadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              title: Text(
                faq['question']!,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              iconColor: AppColors.primaryBlue,
              collapsedIconColor: AppColors.textSecondary,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Text(
                    faq['answer']!,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}