"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LoadingOverlay } from "@mantine/core";
import { DashboardLayout } from "./DashboardLayout";
import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function DashboardShell({ children, allowedRoles }: DashboardShellProps) {
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    hydrate();
    setIsChecking(false);
  }, [hydrate]);

  useEffect(() => {
    if (!isChecking) {
      console.log("Auth check:", { isAuthenticated, user, allowedRoles }); // DEBUG
      
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log("Role not allowed, redirecting..."); // DEBUG
        router.push(`/dashboard/${user.role.replace("_", "-")}`);
      }
    }
  }, [isAuthenticated, isChecking, router, user, allowedRoles]);

  if (isChecking || !isAuthenticated) {
    return <LoadingOverlay visible />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}