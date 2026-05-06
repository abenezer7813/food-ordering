import 'package:dio/dio.dart';

class FeedbackService {
  final Dio _dio;

  FeedbackService(this._dio);

  Future<void> submitFeedback({
    required String loungeId,
    required String orderId,
    required int rating,
    required String comment,
  }) async {
    try {
      await _dio.post('/feedback', data: {
        'lounge_id': loungeId,
        'order_id': orderId,
        'rating': rating,
        'comment': comment,
      });
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to submit feedback';
    }
  }
}