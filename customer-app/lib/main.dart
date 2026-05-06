import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/lounges/models/lounge_model.dart';
import 'package:food_ordering_app/features/lounges/screens/lounges_screen.dart';
import 'package:food_ordering_app/features/lounges/screens/non_cafe_register_screen.dart';
import 'package:food_ordering_app/features/lounges/screens/order_type_screen.dart';
import 'package:food_ordering_app/features/menu/screens/menu_screen.dart';
import 'package:food_ordering_app/features/wallet/screens/wallet_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:food_ordering_app/features/auth/screens/register_screen.dart';
import 'package:food_ordering_app/features/auth/screens/otp_screen.dart';
import 'package:food_ordering_app/features/auth/screens/login_screen.dart';
import 'core/storage/token_storage.dart';
import 'package:food_ordering_app/features/cart/screens/cart_screen.dart';
import 'package:food_ordering_app/features/orders/screens/orders_screen.dart';
import 'package:food_ordering_app/features/orders/screens/order_detail_screen.dart';
import 'package:food_ordering_app/features/orders/models/order_model.dart';
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
),
GoRoute(path: '/order-type',
  builder: (context ,state){
    final lounge=state.extra as Lounge;
    return OrderTypeScreen(lounge: lounge);
  }),
 
GoRoute(
  path: '/non-cafe-register',
 builder: (context, state) {
    final lounge = state.extra as Lounge;
    return NonCafeRegisterScreen(lounge: lounge);
  },
),
GoRoute(
  path: '/menu',
  builder: (context, state) {
    final extra = state.extra as Map<String, dynamic>;
    final lounge = extra['lounge'] as Lounge;
    final isNonCafe = extra['isNonCafe'] as bool;
    return MenuScreen(lounge: lounge, isNonCafe: isNonCafe);
  },
),
GoRoute(
  path: '/cart',
  builder: (context, state) {
    final extra = state.extra as Map<String, dynamic>;
    final lounge = extra['lounge'] as Lounge;
    final isNonCafe = extra['isNonCafe'] as bool;
    return CartScreen(lounge: lounge, isNonCafe: isNonCafe);
  },
),
GoRoute(
  path: '/wallet',
  builder: (context, state) {
    final lounge = state.extra as Lounge;
    return WalletScreen(lounge: lounge);
  },
),
GoRoute(
  path: '/orders',
  builder: (context, state) => const OrdersScreen(),
),
GoRoute(
  path: '/order-detail',
  builder: (context, state) {
    final order = state.extra as Order;
    return OrderDetailScreen(order: order);
  },
),
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