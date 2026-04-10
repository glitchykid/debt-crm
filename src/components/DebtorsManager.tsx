"use client";

import { useState } from "react";
import { Container, Paper, Stack, Typography, Box } from "@mui/material";
import AddDebtorForm from "@/components/AddDebtorForm";
import { DebtorsDataGrid } from "@/components/DebtorsDataGrid";

export function DebtorsManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDebtorAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Container
        maxWidth="lg"
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
            <AddDebtorForm onDebtorAddedAction={handleDebtorAdded} />
          </Paper>
          <Paper variant="outlined" sx={{ flex: 1, minHeight: 0 }}>
            <DebtorsDataGrid refreshTrigger={refreshTrigger} />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
