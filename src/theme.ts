"use client";

/**
 * Design Philosophy: Dense Fintech SaaS
 *
 * Вдохновение: Linear, Vercel, Supabase Dashboard.
 * Принципы:
 * - Один акцент (indigo) + нейтральная серо-синяя база
 * - Информация важнее декора — нет теней, нет скругления, минимум рамок
 * - Плотная типографическая иерархия (body 13px, caption 11px)
 * - Семантические цвета строго по смыслу: зелёный = успех, янтарный = предупреждение, красный = ошибка
 * - Dark / Light через CSS-переменные без перерендера
 */

import { createTheme, alpha } from "@mui/material/styles";
import { ruRU } from "@mui/material/locale";
import { ruRU as DGruRU } from "@mui/x-data-grid/locales";

const ACCENT = {
  light: { main: "#4f46e5", dark: "#3730a3", contrastText: "#ffffff" },
  dark:  { main: "#6366f1", dark: "#4f46e5", contrastText: "#ffffff" },
};

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
            default: "#f5f5f7",   // чуть холоднее — ближе к Apple/Linear
            paper:   "#ffffff",
          },
          primary:   ACCENT.light,
          secondary: {
            main:          "#64748b",
            contrastText:  "#ffffff",
          },
          success: {
            main:         "#16a34a",
            light:        "#dcfce7",
            contrastText: "#ffffff",
          },
          warning: {
            main:         "#d97706",
            light:        "#fef3c7",
            contrastText: "#ffffff",
          },
          error: {
            main:         "#dc2626",
            light:        "#fee2e2",
            contrastText: "#ffffff",
          },
          text: {
            primary:   "#0f172a",
            secondary: "#64748b",
            disabled:  "#94a3b8",
          },
          divider: "#e2e8f0",
          action: {
            hover:    alpha("#0f172a", 0.04),
            selected: alpha("#4f46e5", 0.08),
          },
        },
      },
      dark: {
        palette: {
          background: {
            default: "#0d0d10",
            paper:   "#141418",
          },
          primary:   ACCENT.dark,
          secondary: {
            main:         "#94a3b8",
            contrastText: "#0f172a",
          },
          success: {
            main:         "#22c55e",
            light:        alpha("#22c55e", 0.15),
            contrastText: "#ffffff",
          },
          warning: {
            main:         "#f59e0b",
            light:        alpha("#f59e0b", 0.15),
            contrastText: "#ffffff",
          },
          error: {
            main:         "#ef4444",
            light:        alpha("#ef4444", 0.15),
            contrastText: "#ffffff",
          },
          text: {
            primary:   "#e2e8f0",
            secondary: "#94a3b8",
            disabled:  "#475569",
          },
          divider: "#1e2028",
          action: {
            hover:    alpha("#e2e8f0", 0.06),
            selected: alpha("#6366f1", 0.12),
          },
        },
      },
    },

    typography: {
      fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      fontSize:   13,
      htmlFontSize: 16,

      h6:       { fontSize: "1rem",    fontWeight: 600, lineHeight: 1.4 },
      subtitle1:{ fontSize: "0.875rem",fontWeight: 500, lineHeight: 1.5 },
      subtitle2:{ fontSize: "0.8125rem",fontWeight: 600, lineHeight: 1.4 },
      body1:    { fontSize: "0.8125rem",lineHeight: 1.5 },
      body2:    { fontSize: "0.8125rem",lineHeight: 1.5 },
      caption:  { fontSize: "0.6875rem",lineHeight: 1.4, letterSpacing: "0.02em" },
      overline: { fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.4 },
      button:   { fontSize: "0.8125rem",fontWeight: 500, textTransform: "none", letterSpacing: "0.01em" },
    },

    shape: { borderRadius: 6 },

    // ── Компонентные переопределения ──────────────────────────────────────
    components: {
      // Базовый сброс
      MuiCssBaseline: {
        styleOverrides: {
          "*, *::before, *::after": { boxSizing: "border-box" },
          body: { fontFeatureSettings: '"tnum" 1', WebkitFontSmoothing: "antialiased" },
        },
      },

      // Paper — тонкая рамка, никаких теней
      MuiPaper: {
        defaultProps: { elevation: 0, variant: "outlined" },
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },

      // Button — компактный, без elevation
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: false, size: "small" },
        styleOverrides: {
          root: { fontWeight: 500, boxShadow: "none", "&:hover": { boxShadow: "none" } },
          sizeSmall:  { padding: "4px 10px",  height: 30, fontSize: "0.75rem" },
          sizeMedium: { padding: "6px 14px",  height: 34 },
          containedPrimary: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }),
          outlinedPrimary: ({ theme }) => ({
            borderColor: alpha(theme.palette.primary.main, 0.4),
            "&:hover": { borderColor: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.04) },
          }),
        },
      },

      // IconButton — тонкие иконки
      MuiIconButton: {
        defaultProps: { disableRipple: false, size: "small" },
        styleOverrides: {
          sizeSmall: { padding: 4, borderRadius: 6 },
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            "&:hover": { backgroundColor: theme.palette.action.hover },
            transition: "color 120ms, background-color 120ms",
          }),
        },
      },

      // TextField — compact everywhere
      MuiTextField: {
        defaultProps: { size: "small", variant: "outlined" },
      },
      MuiInputBase: {
        styleOverrides: {
          root: { fontSize: "0.8125rem" },
          sizeSmall: { fontSize: "0.8125rem" },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 6,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.text.secondary,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 1.5,
            },
          }),
          sizeSmall: { paddingTop: 0, paddingBottom: 0 },
          input: { paddingTop: "7px", paddingBottom: "7px" },
          notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
        },
      },
      MuiInputLabel: {
        defaultProps: { shrink: true },
        styleOverrides: {
          root: { fontSize: "0.75rem", fontWeight: 500 },
          sizeSmall: { fontSize: "0.75rem" },
        },
      },

      // Select
      MuiSelect: {
        styleOverrides: {
          select: { paddingTop: "7px", paddingBottom: "7px", fontSize: "0.8125rem" },
        },
      },

      // MenuItem
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: "0.8125rem", minHeight: 32, paddingTop: 5, paddingBottom: 5 },
        },
      },

      // Chip — плоский, с цветным фоном
      MuiChip: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: { fontWeight: 500, fontSize: "0.6875rem", borderRadius: 4, height: 20 },
          colorSuccess: ({ theme }) => ({
            backgroundColor: theme.palette.success.light,
            color: theme.palette.success.main,
            border: "none",
          }),
          colorWarning: ({ theme }) => ({
            backgroundColor: theme.palette.warning.light,
            color: theme.palette.warning.main,
            border: "none",
          }),
          colorError: ({ theme }) => ({
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.main,
            border: "none",
          }),
          colorDefault: ({ theme }) => ({
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.text.secondary,
            border: "none",
          }),
        },
      },

      // Divider
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({ borderColor: theme.palette.divider }),
        },
      },

      // Tooltip — компактный
      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 400 },
        styleOverrides: {
          tooltip: { fontSize: "0.6875rem", padding: "4px 8px" },
        },
      },

      // Alert — компактный
      MuiAlert: {
        styleOverrides: {
          root: { fontSize: "0.8125rem", padding: "6px 12px", borderRadius: 6 },
          message: { padding: 0 },
          icon: { paddingTop: 2 },
        },
      },

      // DataGrid стилизуется напрямую через sx в компоненте (нет module augmentation)

      // Table
      MuiTableCell: {
        styleOverrides: {
          root: { fontSize: "0.8125rem", padding: "6px 8px" },
          head: { fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },
        },
      },

      // Snackbar
      MuiSnackbarContent: {
        styleOverrides: {
          root: { fontSize: "0.8125rem" },
        },
      },
    },
  },
  ruRU,
  DGruRU,
);

export default theme;
