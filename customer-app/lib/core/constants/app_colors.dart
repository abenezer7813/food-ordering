import 'package:flutter/material.dart';

class AppColors {
  AppColors._(); // helps direct usage with out instatiating

  // Primary Brand Colors
  static const Color primaryBlue = Color(0xFF4B73F2);
  static const Color secondaryBlue = Color(0xFF9EACEF);
  static const Color accent = Color(0xFF26A69A);

  // Background Colors
  static const Color background = Color(0xFFF5F5F5);
  static const Color scaffoldBackground = Color(0xE4C0C0C8);

  // Text Colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textLight = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFFA000);
  static const Color info = Color(0xFF2196F3);

  // Border & Divider
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFBDBDBD);

  // Restaurant System Example Colors
  static const Color pendingOrder = Color(0xFFFFA000);
  static const Color preparingOrder = Color(0xFF1E88E5);
  static const Color readyOrder = Color(0xFF43A047);
  static const Color paidOrder = Color(0xFF8E24AA);
}