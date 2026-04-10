import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { InitColorSchemeScript } from "@mui/material";

// Inter — профессиональный нейтральный sans-serif, Perplexity/Linear/Vercel уровень
const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Debt CRM",
  description: "Управление долгами и процентами",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} antialiased`}
        style={{ margin: 0, height: "100dvh", display: "flex", flexDirection: "column" }}
      >
        <InitColorSchemeScript attribute="class" defaultMode="light" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
