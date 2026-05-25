"use client";

import { Menu, UnstyledButton, Group, Text } from "@mantine/core";
import { IconWorld, IconCheck } from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/lib/i18n/i18n-store";

const LANGUAGES: { value: Locale; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "am", label: "Amharic", native: "አማርኛ" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const current = LANGUAGES.find((l) => l.value === locale) ?? LANGUAGES[0];

  return (
    <Menu shadow="md" width={160} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          aria-label={t("language.label")}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Group gap={6}>
            <IconWorld size={18} />
            {/* Show native name of current language */}
            <Text size="sm" fw={500} className={locale === "am" ? "font-ethiopic" : ""}>
              {current.native}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t("language.label")}</Menu.Label>
        {LANGUAGES.map((lang) => (
          <Menu.Item
            key={lang.value}
            onClick={() => setLocale(lang.value)}
            rightSection={locale === lang.value ? <IconCheck size={14} /> : null}
          >
            {/* Amharic option uses Ethiopic font class */}
            <Text
              size="sm"
              className={lang.value === "am" ? "font-ethiopic" : ""}
            >
              {lang.native}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
