import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

// Query Keys
export const menuKeys = {
  all: ["menu"] as const,
  byLounge: (loungeId?: string) => ["menu", loungeId] as const,
};

// Get menu for a lounge
export function useMenu() {
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);
  return useQuery({
    queryKey: menuKeys.byLounge(activeLoungeId ?? undefined),
    queryFn: async () => {
      const data = await menuApi.getByLounge(activeLoungeId ?? undefined);
      return data.menuItems;
    },
  });
}

// Create menu item
export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      estimated_preparation_time: number;
    }) => menuApi.create(data, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

// Toggle menu item availability
export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      menuApi.toggleAvailability(itemId, isAvailable, activeLoungeId ?? undefined),
    onSuccess: async () => {
      // await so the UI re-renders with fresh data before the caller's onSuccess fires
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

// Update menu item
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: {
        name?: string;
        price?: number;
        description?: string;
        estimated_preparation_time?: number;
      };
    }) => menuApi.update(itemId, data, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}