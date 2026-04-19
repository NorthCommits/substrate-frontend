import { create } from "zustand";
import { User } from "@/types";

interface AuthStore {
  token: string | null;
  user: User | null;
  activeApiKey: string | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setActiveApiKey: (key: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  activeApiKey: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("substrate_token");
    const raw = localStorage.getItem("substrate_user");
    let user: User | null = null;
    if (raw) {
      try { user = JSON.parse(raw); } catch { /* ignore */ }
    }
    set({ token, user, hydrated: true });
  },

  setAuth: (token, user) => {
    localStorage.setItem("substrate_token", token);
    localStorage.setItem("substrate_user", JSON.stringify(user));
    set({ token, user });
  },

  setActiveApiKey: (key) => set({ activeApiKey: key }),

  logout: () => {
    localStorage.removeItem("substrate_token");
    localStorage.removeItem("substrate_user");
    set({ token: null, user: null, activeApiKey: null });
  },
}));
