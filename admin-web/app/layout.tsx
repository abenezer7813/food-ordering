import type { Metadata } from "next";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Food ordering admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Injects the correct color scheme before hydration — prevents flash */}
        <ColorSchemeScript localStorageKey="admin-color-scheme" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
