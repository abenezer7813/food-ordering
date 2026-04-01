import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/lib/api";

// Query Keys
export const menuKeys = {
  all: ["menu"] as const,
  byLounge: (loungeId: string) => ["menu", loungeId] as const,
};

// Get menu for a lounge
export function useMenu(loungeId: string) {
  return useQuery({
    queryKey: menuKeys.byLounge(loungeId),
    queryFn: async () => {
      const data = await menuApi.getByLounge(loungeId);
      return data.items;
    },
    enabled: !!loungeId, // Only run if loungeId exists
  });
}

// Create menu item
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      estimated_preparation_time: number;
    }) => menuApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

// Toggle menu item availability
export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      menuApi.toggleAvailability(itemId, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

// Update menu item
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

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
    }) => menuApi.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}