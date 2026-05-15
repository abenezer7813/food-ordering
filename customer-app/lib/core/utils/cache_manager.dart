import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CacheManager {
  static const int _defaultTtlMinutes = 30;

  static Future<void> set(String key, dynamic data,
      {int ttlMinutes = _defaultTtlMinutes}) async {
    final prefs = await SharedPreferences.getInstance();
    final cacheEntry = {
      'data': data,
      'expiry': DateTime.now()
              .add(Duration(minutes: ttlMinutes))
              .millisecondsSinceEpoch,
    };
    await prefs.setString(key, jsonEncode(cacheEntry));
  }

  static Future<dynamic> get(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(key);
    if (raw == null) return null;

    final cacheEntry = jsonDecode(raw);
    final expiry = cacheEntry['expiry'] as int;

    if (DateTime.now().millisecondsSinceEpoch > expiry) {
      await prefs.remove(key); // expired
      return null;
    }

    return cacheEntry['data'];
  }

  static Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}