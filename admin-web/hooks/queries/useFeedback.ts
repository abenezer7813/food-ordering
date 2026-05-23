import { useQuery } from "@tanstack/react-query";
import { feedbackApi } from "@/lib/api";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

// Query Keys
export const feedbackKeys = {
  all: ["feedback"] as const,
  byLounge: (loungeId?: string) => ["feedback", loungeId] as const,
};

// Get all feedback for a lounge
export function useFeedback() {
  const activeLoungeId = useActiveLoungeStore((s) => s.activeLoungeId);
  return useQuery({
    queryKey: feedbackKeys.byLounge(activeLoungeId ?? undefined),
    queryFn: async () => {
      const data = await feedbackApi.getAll(activeLoungeId ?? undefined);
      return data.feedback;
    },
  });
}
