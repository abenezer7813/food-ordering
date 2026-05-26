import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../widgets/input_fields.dart';
import '../widgets/button.dart';
import '../widgets/cards.dart';
import '../validator/input_validator.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _otpSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (!_emailFormKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).forgotPassword(
      email: _emailController.text.trim(),
    );

    final authState = ref.read(authProvider);
    if (authState.isSuccess) {
      setState(() => _otpSent = true);
    } else if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authState.error!),
        backgroundColor: AppColors.error,),
      );
    }
  }

  Future<void> _resetPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).resetPassword(
      email: _emailController.text.trim(),
      otp: _otpController.text.trim(),
      newPassword: _newPasswordController.text,
    );

    final authState = ref.read(authProvider);
    if (authState.isSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully. Please log in.'),
        backgroundColor: AppColors.success,),
      );
      context.go('/login');
    } else if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authState.error!),
        backgroundColor: AppColors.error,),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.mainBg,
      body: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 25),
          child: SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 20),
                Center(
                  child: Column(
                    children: [
                      Cards.logoCard(
                        marginTop: 60,
                        horizontalPadding: 30,
                        verticalPadding: 25,
                        imageWidth: 60,
                        imageHeight: 60,
                        borderRadius: 40,
                        cardColor: AppColors.logoContainer,
                        imagePath: 'assets/images/logo.png',
                      ),
                      const SizedBox(height: 20),
                      Text(
                        _otpSent ? 'Reset Password' : 'Forgot Password',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 30,
                        ),
                      ),
                      Text(
                        _otpSent
                            ? 'Enter the OTP sent to your email'
                            : 'Enter your email to receive an OTP',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.normal,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

               
                if (!_otpSent)
                  Form(
                    key: _emailFormKey,
                    child: Column(
                      children: [
                        InputFields.textInput(
                          controller: _emailController,
                          prefixIcon: Icons.email,
                          text: 'Email',
                          validator: InputValidator.emailValidator,
                        ),
                        const SizedBox(height: 25),
                        Buttons.buttonsCard(
                          text: 'Send OTP',
                          isLoading: authState.isLoading,
                          onTap: _sendOtp,
                          cardColor: AppColors.accent,
                        ),
                      ],
                    ),
                  ),

               
                if (_otpSent)
                  Form(
                    key: _resetFormKey,
                    child: Column(
                      children: [
                        InputFields.textInput(
                          controller: _otpController,
                          prefixIcon: Icons.pin,
                          text: 'OTP Code',
                          validator: (v) =>
                              v == null || v.length != 6 ? 'Enter the 6-digit OTP' : null,
                        ),
                        const SizedBox(height: 25),
                        InputFields.textInput(
                          controller: _newPasswordController,
                          prefixIcon: Icons.lock,
                          suffixIcon: Icons.visibility_off,
                          text: 'New Password',
                          isObscure: true,
                          validator: InputValidator.passwordValidator,
                        ),
                        const SizedBox(height: 25),
                        InputFields.textInput(
                          controller: _confirmPasswordController,
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: Icons.visibility_off,
                          text: 'Confirm Password',
                          isObscure: true,
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Please confirm your password';
                            if (v != _newPasswordController.text) return 'Passwords do not match';
                            return null;
                          },
                        ),
                        const SizedBox(height: 25),
                        Buttons.buttonsCard(
                          text: 'Reset Password',
                          isLoading: authState.isLoading,
                          onTap: _resetPassword,
                          cardColor: AppColors.accent,
                        ),
                        const SizedBox(height: 15),
                        Buttons.textButton(
                          text: 'Resend OTP',
                          textColor: AppColors.logoContainer,
                          onTap: () async {
                            await ref.read(authProvider.notifier).forgotPassword(
                              email: _emailController.text.trim(),
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('OTP resent'),
                              backgroundColor: AppColors.success,),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 25),
                Buttons.textButton(
                  text: 'Back to Login',
                  textColor: AppColors.logoContainer,
                  onTap: () => context.go('/login'),
                ),
                const SizedBox(height: 60),
              ],
            ),
          ),
        ),
      ),
    );
  }
}