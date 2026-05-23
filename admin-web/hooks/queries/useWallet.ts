import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

export const walletKeys = {
  topUpRequests: (loungeId: string) => ["wallet", "topup-requests", loungeId] as const,
};

export function useTopUpRequests(loungeId: string | null) {
  return useQuery({
    queryKey: walletKeys.topUpRequests(loungeId ?? ""),
    queryFn: async () => {
      const data = await walletApi.getTopUpRequests(loungeId!);
      return data.requests;
    },
    enabled: !!loungeId,
    refetchInterval: 30000,
  });
}

export function useCashierApproveTopUp(loungeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => walletApi.cashierApprove(loungeId, requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.topUpRequests(loungeId) });
    },
  });
}

export function useManagerApproveTopUp(loungeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => walletApi.managerApprove(loungeId, requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.topUpRequests(loungeId) });
    },
  });
}

export function useRejectTopUp(loungeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      walletApi.reject(loungeId, requestId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.topUpRequests(loungeId) });
    },
  });
}
