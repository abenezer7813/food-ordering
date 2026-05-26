import { create } from "zustand";
import { useActiveLoungeStore } from "./active-lounge-store";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_first_login: boolean; 
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    document.cookie = `token=${token}; path=/`;
    document.cookie = `is_first_login=${user.is_first_login}; path=/`;

    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 👇 clear cookies
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "is_first_login=; path=/; max-age=0";

    // 👇 clear active lounge state
    useActiveLoungeStore.getState().clear();

    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);

     
      document.cookie = `token=${token}; path=/`;
      document.cookie = `is_first_login=${user.is_first_login}; path=/`;

      set({ user, token, isAuthenticated: true });
    }
  },
}));