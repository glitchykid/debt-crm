"use client";

import { SnackbarProvider } from "notistack";
import { ReactNode } from "react";

export default function AppSnackbarProvider({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={4000}
    >
      {children}
    </SnackbarProvider>
  );
}
