class OrderItem {
  final String id;
  final String menuItemId;
  final String menuItemName;
  final double unitPrice;
  final int quantity;
  final String? specialInstructions;

  OrderItem({
    required this.id,
    required this.menuItemId,
    required this.menuItemName,
    required this.unitPrice,
    required this.quantity,
    this.specialInstructions,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      menuItemId: json['menu_item_id'],
      menuItemName: json['menu_item']['name'],
      unitPrice: double.parse(json['unit_price']),
      quantity: json['quantity'],
      specialInstructions: json['special_instructions'],
    );
  }
}

class Order {
  final String id;
  final String loungeId;
  final String orderType;
  final String status;
  final double totalAmount;
  final int estimatedReadyTime;
  final DateTime createdAt;
  final List<OrderItem> orderItems;

  Order({
    required this.id,
    required this.loungeId,
    required this.orderType,
    required this.status,
    required this.totalAmount,
    required this.estimatedReadyTime,
    required this.createdAt,
    required this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      loungeId: json['lounge_id'],
      orderType: json['order_type'],
      status: json['status'],
      totalAmount: double.parse(json['total_amount']),
      estimatedReadyTime: json['estimated_ready_time'],
      createdAt: DateTime.parse(json['created_at']),
      orderItems: (json['order_items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
    );
  }
}