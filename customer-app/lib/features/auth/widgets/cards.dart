import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

class Cards {
  static Widget logoCard({
    double? marginTop,
    double? horizontalPadding,
    double? verticalPadding,
    double? imageWidth,
    double? imageHeight,
    double? borderRadius,
    Color? cardColor,
    String? imagePath,
  }) {
    return Card(
      elevation: 5, // Adds shadow
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius ?? 40),
      ),
      color: cardColor ?? AppColors.logoContainer,
      margin: EdgeInsets.fromLTRB(0, marginTop ?? 60, 0, 0),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: horizontalPadding ?? 30,
          vertical: verticalPadding ?? 25,
        ),
        child: Image.asset(
          imagePath ?? 'assets/images/logo.png',
          width: imageWidth ?? 60,
          height: imageHeight ?? 60,
        ),
      ),
    );
  }
}