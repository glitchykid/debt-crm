"use client";

import { Container, Typography } from "@mui/material";

export function DebtorInfo({ id }: { id: string }) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold">
        Окно должника
      </Typography>
    </Container>
  );
}
