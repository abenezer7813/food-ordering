class Lounge {
  final String id;
  final String name;
  final bool isActive;

  Lounge({
    required this.id,
    required this.name,
    required this.isActive,
  });

  factory Lounge.fromJson(Map<String, dynamic> json) {
    return Lounge(
      id: json['id'],
      name: json['name'],
      isActive: json['is_active'],
    );
  }
}