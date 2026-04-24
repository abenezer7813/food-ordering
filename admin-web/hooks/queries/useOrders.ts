import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, OrderItem } from "@/lib/api";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  byStatus: (status?: string) => ["orders", { status }] as const,
};

// Get all orders (with optional status filter)
export function useOrders(status?: string) {
  return useQuery({
    queryKey: orderKeys.byStatus(status),
    queryFn: async () => {
      const data = await orderApi.getAll(status);
      return data.orders;
    },
    refetchInterval: 30000, // Auto-refetch every 30 seconds for real-time updates
  });
}

// Update order status (cook)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "preparing" | "ready";
    }) => orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Mark order as collected (cashier)
export function useMarkOrderCollected() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderApi.markCollected(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Create walk-in order (cashier)
export function useCreateWalkInOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { items: OrderItem[]; payment_method: string }) =>
      orderApi.createWalkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}