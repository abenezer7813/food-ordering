import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:food_ordering_app/features/auth/widgets/input_fields.dart';
import '../../../core/constants/app_colors.dart';
import '../validator/input_validator.dart';
import '../providers/auth_provider.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    await ref.read(authProvider.notifier).register(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      gender: _selectedGender,
      deviceToken: _deviceToken,
    );

    final authState = ref.read(authProvider);
    if (authState.isSuccess) {
      context.go('/otp', extra: _emailController.text.trim());
    } else if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authState.error!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 25),
          child: SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 20),
                const Center(
                  child: Text(
                    'Create Your Account',
                    style: TextStyle(
                      color: AppColors.textLight,
                      fontWeight: FontWeight.bold,
                      fontSize: 30,
                    ),
                  ),
                ),
                const SizedBox(height: 30),
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
                      const SizedBox(height: 25),
                      InputFields.textInput(
                        controller: _lastNameController,
                        prefixIcon: Icons.person_2,
                        text: 'Last Name',
                        validator: InputValidator.nameValidator,
                      ),
                      const SizedBox(height: 25),
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
                      const SizedBox(height: 25),
                      InputFields.textInput(
                        controller: _confirmPasswordController,
                        prefixIcon: Icons.password,
                        suffixIcon: Icons.visibility,
                        text: 'Confirm Password',
                        isObscure: true,
                        validator: InputValidator.passwordValidator,
                      ),
                      const SizedBox(height: 25),

                      // Gender toggle
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.textLight,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextButton(
                                onPressed: () {
                                  setState(() => _selectedGender = 'male');
                                },
                                style: TextButton.styleFrom(
                                  backgroundColor: _selectedGender == 'male'
                                      ? AppColors.primaryBlue
                                      : Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                child: Text(
                                  'Male',
                                  style: TextStyle(
                                    color: _selectedGender == 'male'
                                        ? AppColors.textLight
                                        : AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: TextButton(
                                onPressed: () {
                                  setState(() => _selectedGender = 'female');
                                },
                                style: TextButton.styleFrom(
                                  backgroundColor: _selectedGender == 'female'
                                      ? AppColors.primaryBlue
                                      : Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                child: Text(
                                  'Female',
                                  style: TextStyle(
                                    color: _selectedGender == 'female'
                                        ? AppColors.textLight
                                        : AppColors.textPrimary,
                                  ),
                                ),
                             ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Submit button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: authState.isLoading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          child: authState.isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
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

                      // Login link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Already have an account? ',
                            style: TextStyle(color: AppColors.textLight),
                          ),
                          GestureDetector(
                            onTap: () => context.go('/login'),
                            child: const Text(
                              'Login',
                              style: TextStyle(
                                color: AppColors.primaryBlue,
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
    );
  }
}