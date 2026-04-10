"use client";

import { createTheme } from "@mui/material/styles";
import { ruRU } from "@mui/material/locale";
import { ruRU as DGruRU } from "@mui/x-data-grid/locales";

const theme = createTheme(
  {
    cssVariables: {
      colorSchemeSelector: "class",
    },
    defaultColorScheme: "light",
    colorSchemes: {
      light: {
        palette: {
          background: {
            default: "#f4f4f3",
            paper: "#f9f9f8",
          },
          primary: {
            main: "#546e7a",
          },
          text: {
            primary: "#1a2125",
            secondary: "#6b7c84",
          },
          divider: "#dde0e1",
        },
      },
      dark: {
        palette: {
          background: {
            default: "#111416",
            paper: "#1a1f22",
          },
          primary: {
            main: "#78969f",
          },
          text: {
            primary: "#cdd2d4",
            secondary: "#7d8f95",
          },
          divider: "#252c2f",
        },
      },
    },
    typography: {
      fontFamily: "var(--font-jost), Arial, sans-serif",
    },
    shape: {
      borderRadius: 0,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            boxShadow: "none",
            fontWeight: 500,
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  },
  ruRU,
  DGruRU,
);

export default theme;
