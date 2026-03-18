"use client";
import { createTheme } from "@mui/material/styles";
import { ruRU } from "@mui/material/locale";
import { ruRU as DGruRU } from "@mui/x-data-grid/locales";

const theme = createTheme(
  {
    typography: {
      fontFamily: "var(--font-jost)",
    },
  },
  ruRU,
  DGruRU,
);

export default theme;
