import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loungeApi, Lounge } from "@/lib/api";

// Query Keys
export const loungeKeys = {
  all: ["lounges"] as const,
  admin: ["lounges", "admin"] as const,
};

// Get all active lounges
export function useLounges() {
  return useQuery({
    queryKey: loungeKeys.all,
    queryFn: async () => {
      const data = await loungeApi.getAll();
      return data.lounges;
    },
  });
}

// Get all lounges (admin - includes inactive)
export function useLoungesAdmin() {
  return useQuery({
    queryKey: loungeKeys.admin,
    queryFn: async () => {
      const data = await loungeApi.getAllAdmin();
      return data.lounges;
    },
  });
}

// Create lounge
export function useCreateLounge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => loungeApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.all });
      queryClient.invalidateQueries({ queryKey: loungeKeys.admin });
    },
  });
}

// Assign manager to lounge
export function useAssignManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loungeId, managerId }: { loungeId: string; managerId: string }) =>
      loungeApi.assignManager(loungeId, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.all });
      queryClient.invalidateQueries({ queryKey: loungeKeys.admin });
    },
  });
}

// Deactivate lounge
export function useDeactivateLounge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loungeId: string) => loungeApi.deactivate(loungeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loungeKeys.all });
      queryClient.invalidateQueries({ queryKey: loungeKeys.admin });
    },
  });
}