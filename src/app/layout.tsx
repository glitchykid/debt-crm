import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { InitColorSchemeScript } from "@mui/material";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Debt CRM",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${jost.variable} antialiased`}
        style={{ margin: 0, height: "100dvh", display: "flex", flexDirection: "column" }}
      >
        {/* colorSchemeSelector должен совпадать с theme.cssVariables.colorSchemeSelector */}
        <InitColorSchemeScript attribute="class" defaultMode="light" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
