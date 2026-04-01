"use client";

import { useState } from "react";
import { Container, Paper, Stack, Typography } from "@mui/material";
import AddDebtorForm from "@/components/AddDebtorForm";
import { DebtorsDataGrid } from "@/components/DebtorsDataGrid";

export function DebtorsManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDebtorAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Управление должниками
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Добавить нового должника
          </Typography>
          <AddDebtorForm onDebtorAddedAction={handleDebtorAdded} />
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <DebtorsDataGrid refreshTrigger={refreshTrigger} />
        </Paper>
      </Stack>
    </Container>
  );
}
