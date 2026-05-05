class MenuItem {
  final String id;
  final String loungeId;
  final String name;
  final String? description;
  final String? imageUrl;
  final double price;
  final bool isAvailable;
  final int estimatedPreparationTime;

  MenuItem({
    required this.id,
    required this.loungeId,
    required this.name,
    this.description,
    this.imageUrl,
    required this.price,
    required this.isAvailable,
    required this.estimatedPreparationTime,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      loungeId: json['lounge_id'],
      name: json['name'],
      description: json['description'],
      imageUrl: json['image_url'],
      price: double.parse(json['price']),
      isAvailable: json['is_available'],
      estimatedPreparationTime: json['estimated_preparation_time'],
    );
  }
}