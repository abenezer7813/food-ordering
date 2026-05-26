class MenuItem {
  final String id;
  final String loungeId;
  final String name;
  final String? description;
  final String? imageUrl;
  final double price;
  final bool isAvailable;
  final int estimatedPreparationTime;
  final String category;
  // For food: 'breakfast' | 'lunch' | 'dinner' | 'all_day'
  // For drink: 'juice' | 'coffee' | 'tea' | 'water' | 'soda' | 'smoothie' | 'other'
  final String type;

  MenuItem({
    required this.id,
    required this.loungeId,
    required this.name,
    this.description,
    this.imageUrl,
    required this.price,
    required this.isAvailable,
    required this.estimatedPreparationTime,
    required this.category,
    required this.type,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    final category = (json['category'] ?? 'food').toString();
    // API returns meal_type for food items and drink_type for drink items
    final type = category == 'drink'
        ? (json['drink_type'] ?? 'other').toString()
        : (json['meal_type'] ?? 'all_day').toString();

    return MenuItem(
      id: json['id'],
      loungeId: json['lounge_id'],
      name: json['name'],
      description: json['description'],
      imageUrl: json['image_url'],
      price: double.parse(json['price'].toString()),
      isAvailable: json['is_available'],
      estimatedPreparationTime: json['estimated_preparation_time'],
      category: category,
      type: type,
    );
  }
}
