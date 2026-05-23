import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

// Query Keys
export const reportKeys = {
  all: ["reports"] as const,
  sales: (period: string, loungeId?: string, date?: string) => ["reports", "sales", { period, loungeId, date }] as const,
};

// Get sales report
export function useSalesReport(
  period: "daily" | "weekly" | "monthly",
  date?: string
) {
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);
  return useQuery({
    queryKey: reportKeys.sales(period, activeLoungeId ?? undefined, date),
    queryFn: async () => {
      const data = await reportApi.getSales(period, activeLoungeId ?? undefined, date);
      return data.data;
    },
  });
}