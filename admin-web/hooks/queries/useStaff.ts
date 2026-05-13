import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api";
import { da } from "zod/v4/locales";

// Query Keys
export const staffKeys = {
  all: ["staff"] as const,
  managers: ["managers"] as const
};

// Get all staff for lounge
export function useStaff() {
  return useQuery({
    queryKey: staffKeys.all,
    queryFn: async () => {
  const data = await staffApi.getAll();
  return data.staff.map((s: any) => s.user); 
},
  });
}
//get all managers
export function useManagers() {
  return useQuery({
    queryKey: staffKeys.managers,
    queryFn: async () => {
      const data = await staffApi.getAllmanager();
        console.log("managers:", data)

      return data.managers; // return directly, it's already an array
    }
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      role: "cashier" | "cook";
    }) => staffApi.createStaff(data),
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
