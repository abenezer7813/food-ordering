import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, OrderItem } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  byStatus: (status?: string, loungeId?: string) => ["orders", { status, loungeId }] as const,
};

// Get all orders (with optional status filter)
export function useOrders(status?: string) {
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);
  return useQuery({
    queryKey: orderKeys.byStatus(status, activeLoungeId ?? undefined),
    queryFn: async () => {
      const data = await orderApi.getAll(status, activeLoungeId ?? undefined);
      return data.orders;
    },
    refetchInterval: 30000, // Auto-refetch every 30 seconds for real-time updates
  });
}

// Update order status (cook)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "preparing" | "ready";
    }) => orderApi.updateStatus(orderId, status, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Mark order as collected (cashier)
export function useMarkOrderCollected() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: (orderId: string) => orderApi.markCollected(orderId, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Create walk-in order (cashier)
export function useCreateWalkInOrder() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: (data: { items: OrderItem[]; payment_method: string }) =>
      orderApi.createWalkIn(data, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}