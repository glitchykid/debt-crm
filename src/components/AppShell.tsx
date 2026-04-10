"use client";

import { ReactNode } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useColorScheme,
  alpha,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Link from "next/link";

// ─── Логотип ─────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
      {/* Иконка-метка: маленький квадрат с акцентом */}
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "5px",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          component="span"
          sx={{
            color: "primary.contrastText",
            fontSize: "0.625rem",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          D
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "text.primary",
          letterSpacing: "-0.01em",
          userSelect: "none",
        }}
      >
        Debt CRM
      </Typography>
    </Link>
  );
}

// ─── Переключатель темы ──────────────────────────────────────────────────────
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null;

  return (
    <Tooltip title={mode === "dark" ? "Светлая тема" : "Тёмная тема"} enterDelay={600}>
      <IconButton
        size="small"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        sx={{ color: "text.secondary" }}
        aria-label="Переключить тему"
      >
        {mode === "dark" ? (
          <LightModeIcon sx={{ fontSize: 16 }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        maxWidth: 1440,
        width: "100%",
        mx: "auto",
      }}
    >
      {/* Navbar */}
      <Box
        component="header"
        sx={({ palette }) => ({
          display: "flex",
          alignItems: "center",
          px: { xs: 2, sm: 3 },
          height: 44,
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 2,
          backgroundColor: alpha(palette.background.default, 0.85),
          backdropFilter: "blur(8px)",
          // Sticky навбар
          position: "sticky",
          top: 0,
          zIndex: 100,
        })}
      >
        <Logo />

        {/* Разделитель / spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Правый блок */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ThemeToggle />
        </Box>
      </Box>

      {/* Контент */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
