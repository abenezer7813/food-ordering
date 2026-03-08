import 'package:flutter/material.dart';
import 'package:food_ordering_app/features/auth/widgets/input_fields.dart';
import '../../../core/constants/app_colors.dart';
import '../validator/input_validator.dart';
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey=GlobalKey<FormState>();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
         //main container
          child: Container(

            padding: EdgeInsets.symmetric(horizontal: 25),
            child: SingleChildScrollView(
              child: Column(
              
              children: [
              SizedBox(height: 20,),
                      //create ur account text
                      Center(
              child: Text('create your account',
                style: TextStyle(
                  color:AppColors.textLight,
                  fontWeight:FontWeight.bold,
                  fontSize: 30
                ),
              ),
                      ),
              SizedBox(height: 30,),
              //form for the input fields
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    InputFields.textInput(prefixIcon:Icons.person,text:  "Full Name",
                    validator:InputValidator.nameValidator),
                    SizedBox(height: 25,),
                    //last name container
                InputFields.textInput(prefixIcon:Icons.person_2, text: "Last Name"),
                    SizedBox(height: 25,),
                    //email  container
                    InputFields.textInput(prefixIcon:Icons.email,text:  "Email"),
                    SizedBox(height: 25,),
                    //last name container
                InputFields.textInput(prefixIcon:Icons.lock,suffixIcon:Icons.visibility_off, text: "Password",isObscure: true),
                SizedBox(height: 25,),
                    //confirm password container
                    InputFields.textInput(prefixIcon:Icons.password,suffixIcon:Icons.visibility, text: "Confirm Password",isObscure: true),
                    SizedBox(height: 25,),
              
                Container(
                  decoration: BoxDecoration(
                    color:AppColors.textLight,
                    borderRadius: BorderRadius.circular(30),
                  ),
                 child: Row(
                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     Expanded(
                       child: TextButton(
                           onPressed: (){
                           if(_formKey.currentState!.validate()){
                            print('validation is working well');
                           }
                           },
                       style: TextButton.styleFrom(
                              backgroundColor: AppColors.primaryBlue,
                       ),
                           child: Text('Male'),),
                     ),
                     SizedBox(height: 25,),
                Expanded(
                    child: TextButton(onPressed: (){}, child: Text('Female'))),
              
              
                   ],
                 ),
                )
                  ],
                ),
              )
              
                      ],
                    ),
            ),
          )),
    );
  }
}
