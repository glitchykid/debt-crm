"use client";

import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { DebtorsManager } from "@/components/DebtorsManager";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ru";

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <DebtorsManager />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
