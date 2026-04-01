"use client";

import { Box, Typography } from "@mui/material";

export function Debtor({ id }: { id: string }) {
  return (
    <Box>
      <Typography variant="h4">Карточка должника</Typography>
      <Typography>ID должника: {id}</Typography>
    </Box>
  );
}
