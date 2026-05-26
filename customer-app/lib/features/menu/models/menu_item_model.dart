class MenuItem {
  final String id;
  final String loungeId;
  final String name;
  final String? description;
  final String? imageUrl;
  final double price;
  final bool isAvailable;
  final int estimatedPreparationTime;

  // ADD THESE
  final String category;
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

    // ADD THESE
    required this.category,
    required this.type,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      loungeId: json['lounge_id'],
      name: json['name'],
      description: json['description'],
      imageUrl: json['image_url'],
      price: double.parse(json['price'].toString()),
      isAvailable: json['is_available'],
      estimatedPreparationTime: json['estimated_preparation_time'],

      // ADD THESE
      category: json['category'] ?? 'food',
      type: json['type'] ?? 'lunch',
    );
  }
}