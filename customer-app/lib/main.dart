import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/auth/screens/register_screen.dart';
Future <void> main() async {
 
  runApp(MaterialApp(

    debugShowCheckedModeBanner: false,
      initialRoute: "/registration",
      routes:{
        "/registration":(context)=>RegisterScreen()
      }
  ));
}

