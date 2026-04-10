"use client";

import { ReactNode } from "react";
import { Box, IconButton, Typography, useColorScheme, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  if (!mode) return null;

  return (
    <Tooltip title={mode === "dark" ? "Светлая тема" : "Тёмная тема"}>
      <IconButton
        size="small"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        sx={{ color: "text.secondary" }}
      >
        {mode === "dark" ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        maxWidth: 1600,
        width: "100%",
        mx: "auto",
      }}
    >
      {/* Navbar */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          gap: 2,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          letterSpacing={0.5}
          sx={{ textTransform: "uppercase", fontSize: 12, color: "text.primary", flex: 1 }}
        >
          Debt CRM
        </Typography>
        <ThemeToggle />
      </Box>

      {/* Контент */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
