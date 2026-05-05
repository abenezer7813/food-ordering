import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';


class InputFields {
  static Widget textInput({
    required TextEditingController controller,
    required IconData prefixIcon,
    IconData? suffixIcon,
    required String text,
    bool isObscure = false,
    String? Function(String?)? validator,

  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.textLight,
        borderRadius: BorderRadius.circular(30),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isObscure,
        validator: validator,
        decoration: InputDecoration(
          prefixIcon: Icon(prefixIcon),
          suffixIcon: suffixIcon != null ? Icon(suffixIcon) : null,
          labelText: text,
          border: InputBorder.none,
        ),
      ),
    );
  }
}
