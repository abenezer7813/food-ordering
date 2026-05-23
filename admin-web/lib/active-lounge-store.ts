import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveLoungeState {
  activeLoungeId: string | null;
  activeLoungeName: string | null;
  setActiveLounge: (id: string, name: string) => void;
  clear: () => void;
}

export const useActiveLoungeStore = create<ActiveLoungeState>()(
  persist(
    (set) => ({
      activeLoungeId: null,
      activeLoungeName: null,
      setActiveLounge: (id, name) => set({ activeLoungeId: id, activeLoungeName: name }),
      clear: () => set({ activeLoungeId: null, activeLoungeName: null }),
    }),
    { name: "active-lounge" }
  )
);
