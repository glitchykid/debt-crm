"use client";

import { createDebtorAction } from "@/actions/debtors";
import { Box, Button, TextField, Stack, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { KeyboardEvent } from "react";

const STATUS_OPTIONS = [
  { value: "Активен", label: "Активен" },
  { value: "Передан в суд", label: "Передан в суд" },
  { value: "Просрочен", label: "Просрочка" },
  { value: "Закрыт", label: "Закрыт" },
] as const;

export default function AddDebtorForm({
  onDebtorAddedAction,
}: {
  onDebtorAddedAction: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const handleAction = async (formData: FormData) => {
    try {
      const result = await createDebtorAction(formData);
      if (result?.error) {
        enqueueSnackbar(result.error, {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar("Должник успешно добавлен!", {
        variant: "success",
      });
      onDebtorAddedAction();
    } catch (error) {
      enqueueSnackbar("Произошла системная ошибка сети", {
        variant: "error",
      });
      console.error("Системная ошибка:", error);
    }
  };

  const allowDecimalOnly = (e: KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", ".", ","];
    if (!allowed.includes(e.key) && isNaN(Number(e.key))) {
      e.preventDefault();
    }
  };

  return (
    <Box component="form" action={handleAction}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="ФИО"
          name="fullname"
          required
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <TextField
          label="Основная сумма"
          name="principal"
          required
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              inputMode: "decimal",
              pattern: "[0-9]*\\.?[0-9]{0,2}",
              onKeyDown: allowDecimalOnly,
            },
          }}
        />

        <TextField
          label="Проценты"
          name="interest"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              inputMode: "decimal",
              pattern: "[0-9]*\\.?[0-9]{0,2}",
              onKeyDown: allowDecimalOnly,
            },
          }}
        />

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
              InputLabelProps: {
                shrink: true,
              },
            },
          }}
        />

        <DatePicker
          label="Дата закрытия"
          format="DD.MM.YYYY"
          name="closedDate"
          slotProps={{
            textField: {
              InputLabelProps: {
                shrink: true,
              },
            },
          }}
        />

        <DatePicker
          label="Последний платёж"
          format="DD.MM.YYYY"
          name="lastPaymentDate"
          slotProps={{
            textField: {
              InputLabelProps: {
                shrink: true,
              },
            },
          }}
        />

        <DatePicker
          label="Следующий платёж"
          format="DD.MM.YYYY"
          name="nextPaymentDate"
          defaultValue={dayjs().add(32, "day")}
          slotProps={{
            textField: {
              required: true,
              InputLabelProps: {
                shrink: true,
              },
            },
          }}
        />

        <Button type="submit" variant="contained" disableElevation>
          Добавить
        </Button>
      </Stack>
    </Box>
  );
}
