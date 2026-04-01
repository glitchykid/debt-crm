"use client";
import { createTheme } from "@mui/material/styles";
import { ruRU } from "@mui/material/locale";
import { ruRU as DGruRU } from "@mui/x-data-grid/locales";

const theme = createTheme(
  {
    cssVariables: true,
    colorSchemes: {
      light: {
        palette: {
          background: {
            default: "#f5f5f4",
            paper: "#fafaf9",
          },
          primary: {
            main: "#57534e",
          },
          text: {
            primary: "#292524",
            secondary: "#78716c",
          },
          divider: "#e7e5e4",
        },
      },
      dark: {
        palette: {
          background: {
            default: "#1c1917",
            paper: "#292524",
          },
          primary: {
            main: "#a8a29e",
          },
          text: {
            primary: "#f5f5f4",
            secondary: "#a8a29e",
          },
          divider: "#44403c",
        },
      },
    },
    typography: {
      fontFamily: "var(--font-jost), Arial, sans-serif",
    },
    shape: {
      borderRadius: 8,
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
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          },
        },
      },
    },
  },
  ruRU,
  DGruRU,
);

export default theme;
