import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api";

// Query Keys
export const reportKeys = {
  all: ["reports"] as const,
  sales: (period: string, date?: string) => ["reports", "sales", { period, date }] as const,
};

// Get sales report
export function useSalesReport(
  period: "daily" | "weekly" | "monthly",
  date?: string
) {
  return useQuery({
    queryKey: reportKeys.sales(period, date),
    queryFn: async () => {
      const data = await reportApi.getSales(period, date);
      return data.report;
    },
  });
}