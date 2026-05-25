import { create } from "zustand";
import { persist } from "zustand/middleware";
import en from "./en.json";
import am from "./am.json";

export type Locale = "en" | "am";

const translations: Record<Locale, typeof en> = { en, am };

/** Resolve a dot-notation key against the translation object */
function resolve(obj: Record<string, any>, key: string): string {
  const result = key.split(".").reduce((acc, part) => acc?.[part], obj as any);
  return typeof result === "string" ? result : key;
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a dot-notation key, e.g. t("nav.dashboard") */
  t: (key: string) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      t: (key) => resolve(translations[get().locale], key),
    }),
    { name: "admin-locale" } // persists to localStorage
  )
);
