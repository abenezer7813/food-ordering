import 'dart:io';
import 'package:dio/dio.dart';

class CloudinaryService {
  static const String _cloudName = 'dtn1zv1k0';
  static const String _uploadPreset = 'unilounges_preset';

  static Future<String> uploadImage(File imageFile) async {
    final dio = Dio();
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        imageFile.path,
        filename: imageFile.path.split('/').last,
      ),
      'upload_preset': _uploadPreset,
    });

    final response = await dio.post(
      'https://api.cloudinary.com/v1_1/$_cloudName/image/upload',
      data: formData,
    );

    return response.data['secure_url'] as String;
  }
}