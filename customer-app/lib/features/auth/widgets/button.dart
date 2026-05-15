import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class Buttons {
  static Widget buttonsCard({
    required String text,
    Color? textColor,
    Color? cardColor,
    Widget? icon,
    VoidCallback? onTap,
    double? fontSize,
    FontWeight? fontWeight,
    bool isLoading = false,
    double borderRadius = 30,
    EdgeInsetsGeometry? padding,
    double width = double.infinity,
  }) {
    return SizedBox(
      width: width,
      child: GestureDetector(
        onTap: isLoading ? null : onTap,
        child: Container(
          padding: padding ??
              EdgeInsets.symmetric(
                vertical: 15,
                horizontal: icon != null ? 40 : 0,
              ),
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                blurRadius: 5,
                color: Colors.grey.withOpacity(0.5),
                offset: const Offset(0, 2),
                spreadRadius: 3,
              )
            ],
            color: isLoading
                ? Colors.grey
                : cardColor ?? AppColors.primaryBlue,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          child: Center(
            child: isLoading
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2.5,
                    ),
                  )
                : icon != null
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          icon,
                          const SizedBox(width: 20),
                          Text(
                            text,
                            style: TextStyle(
                              color:
                                  textColor ?? AppColors.textLight,
                              fontWeight:
                                  fontWeight ?? FontWeight.bold,
                              fontSize: fontSize ?? 15,
                            ),
                          ),
                        ],
                      )
                    : Text(
                        text,
                        style: TextStyle(
                          color: textColor ?? AppColors.textLight,
                          fontWeight:
                              fontWeight ?? FontWeight.bold,
                          fontSize: fontSize ?? 16,
                        ),
                      ),
          ),
        ),
      ),
    );
  }

  static Widget textButton({
    required String text,
    VoidCallback? onTap,
    Color? textColor,
    double? fontSize,
    FontWeight? fontWeight,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        text,
        style: TextStyle(
          color: textColor ?? AppColors.logoContainer,
          fontSize: fontSize ?? 14,
          fontWeight: fontWeight ?? FontWeight.w500,
        ),
      ),
    );
  }
}