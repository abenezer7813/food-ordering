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
        {/* Noto Sans Ethiopic — proper Ge'ez script rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wdth,wght@75..125,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
