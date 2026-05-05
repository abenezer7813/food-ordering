import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/lounges/screens/lounges_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:food_ordering_app/features/auth/screens/register_screen.dart';
import 'package:food_ordering_app/features/auth/screens/otp_screen.dart';
import 'package:food_ordering_app/features/auth/screens/login_screen.dart';
import 'core/storage/token_storage.dart';

final goRouter = GoRouter(
  initialLocation: '/register',
  redirect: (context, state) async {
    final token = await TokenStorage().getToken();
    final isLoggedIn = token != null;
    final isAuthRoute = state.matchedLocation == '/login' ||
        state.matchedLocation == '/register' ||
        state.matchedLocation == '/otp';

    if (!isLoggedIn && !isAuthRoute) return '/login';
    if (isLoggedIn && isAuthRoute) return '/lounges';
    return null; // no redirect needed
  },
  routes: [
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/otp',
      builder: (context, state) {
        final email = state.extra as String;
        return OtpScreen(email: email);
      },
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    
GoRoute(
path: '/lounges',
builder:(context,state)=>const LoungesScreen()
)
  ],
);
class MyApp extends ConsumerWidget { // what should this extend?
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: goRouter, 
    );
  }
}

void main() {
  runApp(
    ProviderScope(
      child: MyApp(), 
    ),
  );
}