"use client";

import { useRef } from "react";
import { Box, Divider, Typography } from "@mui/material";
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
      }}
    >
      {/* Шапка + форма */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 2, flexShrink: 0 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.secondary"
          letterSpacing={0.5}
          sx={{ textTransform: "uppercase", mb: 1.5, fontSize: 11 }}
        >
          Новый должник
        </Typography>
        <AddDebtorForm onSuccess={() => reloadRef.current?.()} />
      </Box>

      <Divider />

      {/* Таблица — всё оставшееся место */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <DebtorsDataGrid onReloadRef={reloadRef} />
      </Box>
    </Box>
  );
}
