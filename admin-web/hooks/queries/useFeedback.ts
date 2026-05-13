import { useQuery } from "@tanstack/react-query";
import { feedbackApi } from "@/lib/api";

export const feedbackKeys = {
  all: ["feedback"] as const,
};

export function useFeedback() {
  return useQuery({
    queryKey: feedbackKeys.all,
    queryFn: async () => {
      const data = await feedbackApi.getAll();
      return data.feedback;
    },
  });
}