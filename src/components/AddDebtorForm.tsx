"use client";

import { useRef, useState, SyntheticEvent } from "react";
import { createDebtorAction } from "@/actions/debtors";
import { Box, Button, TextField, Stack, MenuItem, Snackbar, Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const STATUS_OPTIONS = [
  { value: "Активен", label: "Активен" },
  { value: "Передан в суд", label: "Передан в суд" },
  { value: "Просрочен", label: "Просрочка" },
  { value: "Закрыт", label: "Закрыт" },
] as const;

export function AddDebtorForm({
  onDebtorAddedAction: onDebtorAddedAction,
}: {
  onDebtorAddedAction: () => void;
}) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const formRef = useRef<HTMLFormElement>(null);
  const handleAction = async (formData: FormData) => {
    const result = await createDebtorAction(formData);
    if (result?.error) {
      setSnackbarMessage(result.error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage("Должник успешно добавлен!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    formRef.current?.reset();
    onDebtorAddedAction();
  };

    const handleCloseSnackbar = (event?: SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      setSnackbarOpen(false);
    }

  return (
    <Box component="form" action={handleAction}>
      <Stack direction="row" spacing={2}>
        <TextField label="ФИО" name="fullname" required />

        <TextField
          select
          label="Статус"
          name="status"
          defaultValue="Активен"
          sx={{ minWidth: 150 }}
          required
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <DatePicker
          label="Дата создания"
          format="DD.MM.YYYY"
          defaultValue={dayjs()}
          disableFuture
          name="createdDate"
          slotProps={{
            textField: {
              required: true,
            },
          }}
        />

        <DatePicker label="Дата закрытия" format="DD.MM.YYYY" name="closedDate" />

        <DatePicker label="Последний платёж" format="DD.MM.YYYY" name="lastPaymentDate" />

        <DatePicker
          label="Следующий платёж"
          format="DD.MM.YYYY"
          name="nextPaymentDate"
          defaultValue={dayjs().add(32, "day")}
          slotProps={{
            textField: {
              required: true,
            },
          }}
        />

        <Button type="submit" variant="contained" disableElevation>
          Добавить
        </Button>
      </Stack>
      <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
        <Alert
        onClose={handleCloseSnackbar}
        severity={snackbarSeverity}
        variant="filled"
        sx={{width: "100%"}}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
