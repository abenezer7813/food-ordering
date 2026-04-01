"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useThemeStore } from "@/lib/theme-store";
import { getRoleDashboardPath } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Sun, Moon, ArrowRight, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

const demoAccounts = [
  { role: "Super Admin", email: "superadmin@university.edu", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { role: "Provider",    email: "provider@university.edu",   color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { role: "Cashier",     email: "cashier@university.edu",    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { role: "Cook",        email: "cook@university.edu",       color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { theme, toggle, hydrate } = useThemeStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { hydrate(); }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError("");
    try {
      const res = await api.login(data.email, data.password);
      setAuth(res.user, res.token || "local");
      router.push(getRoleDashboardPath(res.user.role));
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: "#0f1117", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-[15px]">UniLounge</span>
        </div>
        <div>
          <p className="text-white text-2xl font-bold leading-snug mb-3">
            Manage your university<br />lounge operations
          </p>
          <p className="text-zinc-400 text-[14px] leading-relaxed">
            A modern admin dashboard for orders, menus, staff, and real-time analytics — all in one place.
          </p>
          <div className="mt-8 space-y-3">
            {["Real-time order tracking", "Role-based access control", "Sales analytics & reports", "Multi-lounge management"].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-zinc-300 text-[13px]">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-600 text-[12px]">© 2026 UniLounge. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>UniLounge</span>
          </div>
          <div className="ml-auto">
            <button onClick={toggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h1 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  Email address
                </Label>
                <Input id="email" type="email" placeholder="you@university.edu" {...register("email")} />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  Password
                </Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                    className="pr-9" {...register("password")} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="rounded-lg px-3 py-2.5 text-[12px] text-red-600 dark:text-red-400"
                  style={{ background: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-9 rounded-lg text-[13px] font-medium text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: loading ? "#4f46e5" : "#6366f1" }}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Demo accounts — password: password123
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button key={acc.role}
                    onClick={() => { setValue("email", acc.email); setValue("password", "password123"); }}
                    className={`text-left px-3 py-2 rounded-lg border text-[11px] font-medium transition-all hover:scale-[1.02] ${acc.color}`}>
                    <p className="font-semibold">{acc.role}</p>
                    <p className="opacity-70 truncate mt-0.5">{acc.email.split("@")[0]}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
