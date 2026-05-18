import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/lounges/models/lounge_model.dart';
import 'package:food_ordering_app/features/lounges/screens/lounges_screen.dart';
import 'package:food_ordering_app/features/lounges/screens/non_cafe_register_screen.dart';
import 'package:food_ordering_app/features/lounges/screens/order_type_screen.dart';
import 'package:food_ordering_app/features/menu/screens/menu_screen.dart';
import 'package:food_ordering_app/features/orders/screens/order_history_screen.dart';
import 'package:food_ordering_app/features/profile/screens/about_screen.dart';
import 'package:food_ordering_app/features/profile/screens/change_password_screen.dart';
import 'package:food_ordering_app/features/profile/screens/edit_profile_screen.dart';
import 'package:food_ordering_app/features/profile/screens/faq_screen.dart';
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
import 'package:food_ordering_app/features/feedback/screens/feedback_screen.dart';
import 'package:food_ordering_app/features/profile/screens/profile_screen.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/services/notification_service.dart';
import 'package:food_ordering_app/features/auth/screens/forgot_password_screen.dart';
final goRouter = GoRouter(
  initialLocation: '/register',
  redirect: (context, state) async {
    final token = await TokenStorage().getToken();
    final isLoggedIn = token != null;
    final isAuthRoute = state.matchedLocation == '/login' ||
        state.matchedLocation == '/register' ||
        state.matchedLocation == '/otp'||
        state.matchedLocation=='/forgot-password';

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
GoRoute(
  path: '/feedback',
  builder: (context, state) {
    final extra = state.extra as Map<String, dynamic>;
    return FeedbackScreen(
      loungeId: extra['lounge_id'] as String,
      orderId: extra['order_id'] as String,
    );
  },
),
GoRoute(
  path: '/profile',
  builder: (context, state) => const ProfileScreen(),
),
GoRoute(path: '/history',
builder: (context, state) => OrderHistoryScreen(),),
GoRoute(
  path: '/edit-profile',
  builder: (context, state) => const EditProfileScreen(),
),
GoRoute(
  path: '/faq',
  builder: (context, state) => const FaqScreen(),
),
GoRoute(
  path: '/about',
  builder: (context, state) => const AboutScreen(),
),
GoRoute(
  path: '/forgot-password',
  builder: (context, state) => const ForgotPasswordScreen(),
),
GoRoute(
  path: '/change-password',
  builder: (context, state) => const ChangePasswordScreen(),
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

// Background message handler - must be top level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService.initialize();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}