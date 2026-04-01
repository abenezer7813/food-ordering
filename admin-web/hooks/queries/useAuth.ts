import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { getRoleDashboardPath } from "@/lib/utils";
import { notifications } from "@mantine/notifications";
import { notifyError, notifySuccess } from "@/lib/notification";


export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {

      console.log("Login success:", data); // DEBUG

      // Set auth in store and localStorage
      setAuth(data.user, data.token);
      notifySuccess("Login successfuly")
      // Get the dashboard path
      const dashboardPath = getRoleDashboardPath(data.user.role);
      console.log("Redirecting to:", dashboardPath); // DEBUG

      // Force redirect with replace
      router.replace(dashboardPath);
    },
    onError: (error) => {
      notifyError(error.message || "Invalid Credintials")
      console.error("Login error:", error); // DEBUG
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      router.replace("/auth/login");
    },
  });
}