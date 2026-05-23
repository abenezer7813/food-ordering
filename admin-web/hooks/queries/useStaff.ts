import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

// Query Keys
export const staffKeys = {
  all: (loungeId?: string) => ["staff", loungeId] as const,
  managers: ["managers"] as const,
  myLounges: ["my-lounges"] as const,
};

// Get all staff for the active lounge
export function useStaff() {
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);
  return useQuery({
    queryKey: staffKeys.all(activeLoungeId ?? undefined),
    queryFn: async () => {
      const data = await staffApi.getAll(activeLoungeId ?? undefined);
      return data.staff.map((s: any) => s.user);
    },
    enabled: !!activeLoungeId,
  });
}

// Get all managers
export function useManagers() {
  return useQuery({
    queryKey: staffKeys.managers,
    queryFn: async () => {
      const data = await staffApi.getAllmanager();
      return data.managers;
    },
  });
}

// Get the single lounge for cashier/cook (unchanged)
export function useMyLounge() {
  return useQuery({
    queryKey: ["my-lounge"],
    queryFn: () => staffApi.getMyLounge(),
    staleTime: Infinity,
  });
}

// Get ALL lounges for the logged-in manager
export function useMyLounges() {
  return useQuery({
    queryKey: staffKeys.myLounges,
    queryFn: async () => {
      const data = await staffApi.getMyLounges();
      return data.lounges;
    },
    staleTime: Infinity,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      role: "cashier" | "cook";
    }) => staffApi.createStaff(data, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all(activeLoungeId ?? undefined) });
    },
  });
}

// Deactivate staff
export function useDeactivateStaff() {
  const queryClient = useQueryClient();
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);

  return useMutation({
    mutationFn: (staffId: string) =>
      staffApi.deactivate(staffId, activeLoungeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all(activeLoungeId ?? undefined) });
    },
  });
}
