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
    onSuccess: (data: any) => {
    
      if (data.requiresOtp) {
        router.replace(`/auth/admin-otp?email=${encodeURIComponent(data.email)}`);
        return;
      }

     
      setAuth(data.user, data.token);
      notifySuccess("Login successfully");
      const dashboardPath = getRoleDashboardPath(data.user.role);
      router.replace(dashboardPath);
    },
    onError: (error) => {
      notifyError(error.message || "Invalid Credentials");
      console.error("Login error:", error);
    },
  });
}
export function useVerifyAdminOtp() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyAdminOtp(email, otp),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      notifySuccess("Login successfully");
      const dashboardPath = getRoleDashboardPath(data.user.role);
      router.replace(dashboardPath);
    },
    onError: (error) => {
      notifyError(error.message || "Invalid OTP");
    },
  });
}
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      authApi.forgotPassword(email),
    onSuccess: () => {
      notifySuccess("If an account exists, an OTP has been sent to your email.");
    },
    onError: (error: Error) => {
      notifyError(error.message || "Something went wrong");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      email,
      otp,
      new_password,
    }: {
      email: string;
      otp: string;
      new_password: string;
    }) => authApi.resetPassword(email, otp, new_password),
    onSuccess: () => {
      notifySuccess("Password reset successfully. Please log in.");
      router.replace("/auth/login");
    },
    onError: (error: Error) => {
      notifyError(error.message || "Invalid or expired OTP");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      current_password,
      new_password,
    }: {
      current_password: string;
      new_password: string;
    }) => authApi.changePassword(current_password, new_password),
    onSuccess: () => {
      notifySuccess("Password changed successfully.");
    },
    onError: (error: Error) => {
      notifyError(error.message || "Current password is incorrect");
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
