"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { queryClient } from "@/lib/query-client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

const theme = createTheme({
  primaryColor: "indigo",
  fontFamily: "var(--font-geist-sans), sans-serif",
  defaultRadius: "md",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <Notifications position="bottom-right" />
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}