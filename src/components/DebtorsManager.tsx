"use client";

import { useRef } from "react";
import { Container, Paper, Stack, Typography, Box } from "@mui/material";
import AddDebtorForm from "@/components/AddDebtorForm";
import { DebtorsDataGrid } from "@/components/DebtorsDataGrid";

/**
 * DebtorsManager — оркестрирует форму добавления и таблицу.
 * После успешного добавления вызывает reload() через ref на DataGrid.
 */
export function DebtorsManager() {
  const reloadRef = useRef<(() => void) | null>(null);

  const handleSuccess = () => {
    reloadRef.current?.();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={4} sx={{ flex: 1, minHeight: 0 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Управление должниками
          </Typography>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Добавить нового должника
            </Typography>
            <AddDebtorForm onSuccess={handleSuccess} />
          </Paper>

          <Paper variant="outlined" sx={{ flex: 1, minHeight: 400 }}>
            <DebtorsDataGrid onReloadRef={reloadRef} />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
