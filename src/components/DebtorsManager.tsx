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
      {/* Форма добавления */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 1.5, flexShrink: 0 }}>
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.disabled"
          letterSpacing={0.8}
          sx={{ textTransform: "uppercase", display: "block", mb: 1.5 }}
        >
          Новый должник
        </Typography>
        <AddDebtorForm onSuccess={() => reloadRef.current?.()} />
      </Box>

      <Divider />

      {/* Таблица — всё оставшееся место, не прыгает по ширине */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <DebtorsDataGrid onReloadRef={reloadRef} />
      </Box>
    </Box>
  );
}
