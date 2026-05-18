import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import 'package:food_ordering_app/features/auth/widgets/cards.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String email;

  const OtpScreen({
    super.key,
    required this.email,
  });

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpController = TextEditingController();

  Timer? _timer;

  // 10 minutes = 600 seconds
  int _secondsRemaining = 60;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();

    setState(() {
      _secondsRemaining = 60;
    });

    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (timer) {
        if (_secondsRemaining > 0) {
          setState(() {
            _secondsRemaining--;
          });
        } else {
          timer.cancel();
        }
      },
    );
  }

  Future<void> _submit() async {
    if (_otpController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter the OTP'),
        ),
      );
      return;
    }

    await ref.read(authProvider.notifier).verifyOtp(
          email: widget.email,
          otp: _otpController.text.trim(),
        );

    final authState = ref.read(authProvider);

    if (authState.isSuccess) {
      context.go('/lounges');
    } else if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authState.error!),
        ),
      );
    }
  }

  Future<void> _resendOtp() async {
    await ref.read(authProvider.notifier).resendOtp(
          email: widget.email,
        );

    final authState = ref.read(authProvider);

    if (authState.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP resent successfully'),
        ),
      );

      _startTimer();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authState.error!),
        ),
      );
    }
  }

  String get _formattedTime {
    final minutes = (_secondsRemaining ~/ 60)
        .toString()
        .padLeft(2, '0');

    final seconds = (_secondsRemaining % 60)
        .toString()
        .padLeft(2, '0');

    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.mainBg,
      body: SafeArea(
  child: SingleChildScrollView(
    keyboardDismissBehavior:
        ScrollViewKeyboardDismissBehavior.onDrag,
    child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 35,
            vertical: 130,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            
            children: [
               Column(children: [
                  Cards.logoCard(
                        marginTop: 0,
                        horizontalPadding: 30,
                        verticalPadding: 25,
                        imageWidth: 60,
                        imageHeight: 60,
                        borderRadius: 40,
                        cardColor: AppColors.logoContainer,
                        imagePath: 'assets/images/logo.png',
                      ),
                const SizedBox(height: 40),
                   const Text(
                'Verify Your Email',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 30,
                ),
              ),

              const SizedBox(height: 15),

              Text(
                'We sent a 6-digit code to',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 15,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                '${widget.email}',
                style: const TextStyle(
                  color: AppColors.logoContainer,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 40),
              

              Container(
                decoration: BoxDecoration(
                  color: AppColors.textLight,
                  
                  borderRadius: BorderRadius.circular(20),
                ),
                child: TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 6,
                  decoration: const InputDecoration(
                    hintText: 'Enter OTP',
                    border: InputBorder.none,
                    counterText: '',

                    contentPadding: EdgeInsets.symmetric(
                      vertical: 15,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 40),
              Padding(padding: EdgeInsets.symmetric(horizontal: 35),
              child: Row(
  mainAxisAlignment: MainAxisAlignment.center,
  crossAxisAlignment: CrossAxisAlignment.start,

  children: [
    const Icon(
      Icons.verified_user_outlined,
      size: 18,
      color: AppColors.textSecondary,
    ),

    const SizedBox(width: 8),

    Expanded(
      child: Text(
        'Enter the 6-digit code to verify your email and continue',
        style: const TextStyle(
          color: AppColors.textSecondary,
          fontSize: 13,
          height: 1.5,
        ),
        textAlign: TextAlign.center,
      ),
    ),
  ],
),),
              const SizedBox(height: 20),


              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: authState.isLoading
                      ? null
                      : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        AppColors.primaryBlue,
                    padding:
                        const EdgeInsets.symmetric(
                      vertical: 15,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(30),
                    ),
                  ),
                  child: authState.isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child:
                              CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Verify',
                          style: TextStyle(
                            color:
                                AppColors.textLight,
                            fontSize: 16,
                            fontWeight:
                                FontWeight.bold,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 20),

              _secondsRemaining > 0
                  ? Text(
                      'Resend OTP in $_formattedTime',
                      style: const TextStyle(
                        color:
                            AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    )
                  : TextButton(
                      onPressed: authState.isLoading
                          ? null
                          : _resendOtp,
                      child: const Text(
                        'Resend OTP',
                        style: TextStyle(
                          color:
                              AppColors.primaryBlue,
                          fontWeight:
                              FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
           
                ],)
              
              
              ],
          ),
        ),)
      ),
    );
  }
}