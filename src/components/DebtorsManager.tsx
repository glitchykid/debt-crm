"use client";

import { useRef } from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";
import AddDebtorForm from "@/components/AddDebtorForm";
import { DebtorsDataGrid } from "@/components/DebtorsDataGrid";

export function DebtorsManager() {
  const reloadRef = useRef<(() => void) | null>(null);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        px: { xs: 2, md: 4 },
        py: 3,
        gap: 3,
      }}
    >
      <Typography variant="h5" component="h1" fontWeight={600}>
        Управление должниками
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
          Новый должник
        </Typography>
        <AddDebtorForm onSuccess={() => reloadRef.current?.()} />
      </Paper>

      {/* Таблица растягивается на всё оставшееся место */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <DebtorsDataGrid onReloadRef={reloadRef} />
      </Paper>
    </Box>
  );
}
