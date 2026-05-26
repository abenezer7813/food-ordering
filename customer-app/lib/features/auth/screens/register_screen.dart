import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:food_ordering_app/features/auth/widgets/input_fields.dart';
import '../../../core/constants/app_colors.dart';
import '../validator/input_validator.dart';
import '../providers/auth_provider.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:food_ordering_app/features/auth/widgets/cards.dart';
import 'package:food_ordering_app/features/auth/widgets/button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isPasswordHidden = true;
  bool _isConfirmPasswordHidden = true;
  String _selectedGender = 'male';
  String? _deviceToken;

  @override
  void initState() {
    super.initState();
    _getFCMToken();
  }

  Future<void> _getFCMToken() async {
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();
    final token = await messaging.getToken();
    print('FCM Token: $token');
    setState(() {
      _deviceToken = token;
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Passwords do not match')));
      return;
    }

    await ref
        .read(authProvider.notifier)
        .register(
          firstName: _firstNameController.text.trim(),
          lastName: _lastNameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          gender: _selectedGender,
          deviceToken: _deviceToken,
        );

    final authState = ref.read(authProvider);
    if (authState.isSuccess) {
      context.push('/otp', extra: _emailController.text.trim());
    } else if (authState.error != null) {
      print(authState.error);
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
                  Center(
                    child: Column(
                      children: [
                        Cards.logoCard(
                          marginTop: 20,
                          horizontalPadding: 25,
                          verticalPadding: 20,
                          imageWidth: 30,
                          imageHeight: 30,
                          borderRadius: 27,
                          cardColor: AppColors.logoContainer,
                          imagePath: 'assets/images/logo.png',
                        ),
                        const SizedBox(height: 20),

                        Text(
                          'Create Your Account',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 30,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        InputFields.textInput(
                          controller: _firstNameController,
                          prefixIcon: Icons.person,
                          text: 'First Name',
                          validator: InputValidator.nameValidator,
                        ),
                        const SizedBox(height: 15),
                        InputFields.textInput(
                          controller: _lastNameController,
                          prefixIcon: Icons.person_2,
                          text: 'Last Name',
                          validator: InputValidator.nameValidator,
                        ),
                        const SizedBox(height: 15),
                        InputFields.textInput(
                          controller: _emailController,
                          prefixIcon: Icons.email,
                          text: 'Email',
                          validator: InputValidator.emailValidator,
                        ),
                        const SizedBox(height: 15),
                        InputFields.textInput(
                          controller: _passwordController,
                          prefixIcon: Icons.lock,
                          suffixIcon: _isPasswordHidden
                              ? Icons.visibility_off
                              : Icons.visibility,
                          text: 'Password',
                          isObscure: _isPasswordHidden,
                          validator: InputValidator.passwordValidator,
                          onSuffixTap: () {
                            setState(() {
                              _isPasswordHidden = !_isPasswordHidden;
                            });
                          },
                        ),
                        const SizedBox(height: 15),
                        InputFields.textInput(
                          controller: _confirmPasswordController,
                          prefixIcon: Icons.password,
                          suffixIcon: _isConfirmPasswordHidden
                              ? Icons.visibility_off
                              : Icons.visibility,
                          text: 'Confirm Password',
                          isObscure: _isConfirmPasswordHidden,
                          validator: InputValidator.passwordValidator,
                          onSuffixTap: () {
                            setState(() {
                              _isConfirmPasswordHidden =
                                  !_isConfirmPasswordHidden;
                            });
                          },
                        ),
                        const SizedBox(height: 15),

                        // Gender toggle
                        Container(
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.textLight,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 250),
                                  margin: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: _selectedGender == 'male'
                                        ? AppColors.accent
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                  child: TextButton.icon(
                                    onPressed: () {
                                      setState(() => _selectedGender = 'male');
                                    },
                                    icon: Icon(
                                      Icons.male,
                                      color: _selectedGender == 'male'
                                          ? AppColors.textLight
                                          : AppColors.textPrimary,
                                    ),
                                    label: Text(
                                      'Male',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                        color: _selectedGender == 'male'
                                            ? AppColors.textLight
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    style: TextButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              Expanded(
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 250),
                                  margin: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: _selectedGender == 'female'
                                        ? AppColors.accent
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                  child: TextButton.icon(
                                    onPressed: () {
                                      setState(
                                        () => _selectedGender = 'female',
                                      );
                                    },
                                    icon: Icon(
                                      Icons.female,
                                      color: _selectedGender == 'female'
                                          ? AppColors.textLight
                                          : AppColors.textPrimary,
                                    ),
                                    label: Text(
                                      'Female',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                        color: _selectedGender == 'female'
                                            ? AppColors.textLight
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    style: TextButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 15),

                        // Submit button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: authState.isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              padding: const EdgeInsets.symmetric(vertical: 15),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                            child: authState.isLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white,
                                  )
                                : const Text(
                                    'Register',
                                    style: TextStyle(
                                      color: AppColors.textLight,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 20),

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
                          isLoading: authState.isLoading,
                          onTap: () async {
                            await ref.read(authProvider.notifier).googleLogin();
                            final state = ref.read(authProvider);
                            if (state.isSuccess) {
                              context.go('/lounges');
                            } else if (state.error != null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(state.error!)),
                              );
                            }
                          },
                        ),
                        SizedBox(height: 30),

                        // Login link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Already have an account? ',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                            GestureDetector(
                              onTap: () => context.go('/login'),
                              child: const Text(
                                'Login',
                                style: TextStyle(
                                  color: AppColors.accent,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
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
