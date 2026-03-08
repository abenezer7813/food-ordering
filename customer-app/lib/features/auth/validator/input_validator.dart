class InputValidator{
  static String? nameValidator(String? value){
    if (value==null||value==""){
      return "Please enter your name";
}
    return null;
}

}