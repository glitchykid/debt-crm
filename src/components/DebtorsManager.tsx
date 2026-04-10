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
      {/* Панель добавления */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 2,
          pb: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Заголовок секции */}
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ display: "block", mb: 1.25 }}
        >
          Новый должник
        </Typography>

        <AddDebtorForm onSuccess={() => reloadRef.current?.()} />
      </Box>

      <Divider />

      {/* Таблица — занимает всё оставшееся место */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DebtorsDataGrid onReloadRef={reloadRef} />
      </Box>
    </Box>
  );
}
