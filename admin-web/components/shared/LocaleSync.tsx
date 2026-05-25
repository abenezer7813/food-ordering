"use client";

/**
 * LocaleSync — mounts invisibly and keeps the <html lang="..."> attribute
 * in sync with the i18n store. This enables the :lang(am) CSS selector and
 * correct screen-reader language announcements.
 */
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function LocaleSync() {
  const { locale } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
