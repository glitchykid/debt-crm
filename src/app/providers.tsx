"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ru";
import dynamic from "next/dynamic";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { AppShell } from "@/components/AppShell";

const ClientSnackbarProvider = dynamic(() => import("@/app/snackbar"), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <ClientSnackbarProvider>
            <AppShell>{children}</AppShell>
          </ClientSnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
