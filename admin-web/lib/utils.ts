import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRoleDashboardPath = (role: string): string => {
  // Handle both snake_case and normal case
  const normalizedRole = role.toLowerCase().replace("_", "-");
  
  const roleMap: Record<string, string> = {
    "super-admin": "/dashboard/super-admin",
    "superadmin": "/dashboard/super-admin",
    "lounge-manager": "/dashboard/provider",
    "loungemanager": "/dashboard/provider",
    "provider": "/dashboard/provider",
    "cashier": "/dashboard/cashier",
    "cook": "/dashboard/cook",
  };
  
  console.log("Role:", role, "Normalized:", normalizedRole, "Path:", roleMap[normalizedRole]); // DEBUG
  
  return roleMap[normalizedRole] || "/dashboard";
};