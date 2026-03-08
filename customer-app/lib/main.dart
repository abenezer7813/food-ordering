import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/auth/screens/register_screen.dart';

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
      initialRoute: "/registration",
      routes:{
        "/registration":(context)=>RegisterScreen()
      }
  ));
}

