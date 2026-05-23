"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { queryClient } from "@/lib/query-client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const theme = createTheme({
  primaryColor: "indigo",
  fontFamily: "var(--font-geist-sans), sans-serif",
  defaultRadius: "md",
});

const colorSchemeManager = localStorageColorSchemeManager({
  key: "admin-color-scheme",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
      <Notifications position="bottom-right" />
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MantineProvider>
  );
}
