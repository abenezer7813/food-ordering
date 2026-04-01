import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api";

// Query Keys
export const staffKeys = {
  all: ["staff"] as const,
};

// Get all staff for lounge
export function useStaff() {
  return useQuery({
    queryKey: staffKeys.all,
    queryFn: async () => {
      const data = await staffApi.getAll();
      return data.staff;
    },
  });
}

// Create cashier
export function useCreateCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    }) => staffApi.createCashier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

// Create cook
export function useCreateCook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    }) => staffApi.createCook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

// Deactivate staff
export function useDeactivateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffApi.deactivate(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}