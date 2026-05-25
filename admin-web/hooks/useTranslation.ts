/**
 * useTranslation — thin hook wrapping the i18n store.
 *
 * Usage:
 *   const { t, locale, setLocale } = useTranslation();
 *   <p>{t("nav.dashboard")}</p>
 *
 * Adding new strings:
 *   1. Add the key/value to lib/i18n/en.json and lib/i18n/am.json
 *   2. TypeScript will surface the new key automatically via TranslationKey
 */
export { useI18nStore as useTranslation } from "@/lib/i18n/i18n-store";
