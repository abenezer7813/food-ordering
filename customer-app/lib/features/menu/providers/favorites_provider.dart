import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Persists a Set of favorited menu item IDs to shared_preferences.
// Key is scoped per lounge so favorites don't bleed across lounges.

class FavoritesNotifier extends StateNotifier<Set<String>> {
  final String _prefsKey;

  FavoritesNotifier(this._prefsKey) : super({}) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getStringList(_prefsKey) ?? [];
    state = saved.toSet();
  }

  Future<void> toggle(String itemId) async {
    final updated = Set<String>.from(state);
    if (updated.contains(itemId)) {
      updated.remove(itemId);
    } else {
      updated.add(itemId);
    }
    state = updated;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_prefsKey, updated.toList());
  }

  bool isFavorite(String itemId) => state.contains(itemId);
}

// Family provider — one notifier per lounge
final favoritesProvider =
    StateNotifierProvider.family<FavoritesNotifier, Set<String>, String>(
      (ref, loungeId) => FavoritesNotifier('favorites_$loungeId'),
    );
