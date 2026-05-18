import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../widgets/input_fields.dart';
import '../validator/input_validator.dart';
import '../providers/auth_provider.dart';
import 'package:food_ordering_app/features/auth/widgets/cards.dart';
import 'package:food_ordering_app/features/auth/widgets/button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    await ref
        .read(authProvider.notifier)
        .login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    final authState = ref.read(authProvider);
    if (authState.isSuccess) {
      context.go('/lounges');
    } else if (authState.error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(authState.error!)));
    }
    
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

  return AnnotatedRegion<SystemUiOverlayStyle>(
  value: const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
  ),
  child: Scaffold(
      backgroundColor: AppColors.mainBg,
      body: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 25),
          child: SingleChildScrollView(
            child: Column(
              children: [
                SizedBox(height: 20),
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
                        'Welcome Back',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 30,
                        ),
                      ),
                      Text(
                        'Login to manage your orders',
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

                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      InputFields.textInput(
                        controller: _emailController,
                        prefixIcon: Icons.email,
                        text: 'Email',
                        validator: InputValidator.emailValidator,
                      ),
                      const SizedBox(height: 25),
                      InputFields.textInput(
                        controller: _passwordController,
                        prefixIcon: Icons.lock,
                        suffixIcon: Icons.visibility_off,
                        text: 'Password',
                        isObscure: true,
                        validator: InputValidator.passwordValidator,
                      ),
                      const SizedBox(height: 15),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Buttons.textButton(
                            text: "Forget Password?",
                            textColor: AppColors.logoContainer,
                            onTap: () => {context.go(
                              '/forgot-password',
                            ), print('tapppppped')}
                          ),
                        ],
                      ),
                      SizedBox(height: 15),

                      Buttons.buttonsCard(
                        text: "Login",
                        isLoading: authState.isLoading,
                        onTap: _submit,
                        cardColor: AppColors.primaryBlue,
                      ),
                      const SizedBox(height: 25),
                      Row(
                        children: [
                          Expanded(
                            child: Divider(
                              color: AppColors.divider,
                              thickness: 1,
                              indent: 20,
                              endIndent: 10,
                            ),
                          ),
                          Text(
                            "OR CONTINUE WITH",
                            style: TextStyle(
                              color: AppColors.divider,
                              fontSize: 14,
                            ),
                          ),
                          Expanded(
                            child: Divider(
                              color: AppColors.divider,
                              thickness: 1,
                              indent: 10,
                              endIndent: 20,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 25),
                      Buttons.buttonsCard(
                        text: "Continue with Google",
                        icon: Image.asset(
                          'assets/images/google_logo.png',
                          height: 24,
                          width: 24,
                        ),
                        textColor: AppColors.textPrimary,
                        cardColor: AppColors.textLight,
                      ),
                      SizedBox(height: 60),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Don't have an account? ",
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                          Buttons.textButton(
                            text: "Sign Up",
                            onTap: () => context.go('/register'),

                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      ),
);
  }
}
