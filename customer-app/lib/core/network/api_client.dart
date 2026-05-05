import 'package:dio/dio.dart';
import '../storage/token_storage.dart';



class ApiClient {
  final Dio _dio;
  final TokenStorage _tokenStorage;

  ApiClient(this._tokenStorage) : _dio = Dio(
    BaseOptions(
      baseUrl: 'https://unsplendorously-unrecited-daina.ngrok-free.dev', 
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
    ),
  ) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _tokenStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] ='Bearer $token'; // how do you attach a Bearer token?
        }
        handler.next(options); // always call this to continue the request
      },
    ));
  }

  Dio get dio => _dio;
}