"use client";

import { createDebtorAction } from "@/actions/debtors";
import { Box, Button, TextField, Stack, MenuItem, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { KeyboardEvent } from "react";

export const STATUS_OPTIONS = [
  { value: "Активен",        label: "Активен" },
  { value: "Передан в суд",  label: "Передан в суд" },
  { value: "Просрочен",      label: "Просрочен" },
  { value: "Закрыт",         label: "Закрыт" },
] as const;

function allowDecimalOnly(e: KeyboardEvent<HTMLInputElement>) {
  const ctrl = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", ".", ","];
  if (!ctrl.includes(e.key) && isNaN(Number(e.key))) e.preventDefault();
}

const decimalSlot = {
  inputLabel: { shrink: true },
  htmlInput: { inputMode: "decimal" as const, onKeyDown: allowDecimalOnly },
};

const datePickerSlot = (label: string, required = false, width = 140) => ({
  textField: {
    required,
    size: "small" as const,
    sx: { width },
    slotProps: { inputLabel: { shrink: true } },
    label,
  },
});

export default function AddDebtorForm({ onSuccess }: { onSuccess: () => void }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async (formData: FormData) => {
    const result = await createDebtorAction(formData);
    if (!result.success) {
      enqueueSnackbar(result.error, { variant: "error" });
      return;
    }
    enqueueSnackbar("Должник добавлен", { variant: "success" });
    onSuccess();
  };

  return (
    <Box component="form" action={handleAction}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-end">

        {/* ФИО */}
        <TextField
          label="ФИО"
          name="fullname"
          required
          size="small"
          placeholder="Иванов Иван Иванович"
          sx={{ minWidth: 200, flex: "2 1 200px" }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* Статус */}
        <TextField
          select
          label="Статус"
          name="status"
          defaultValue="Активен"
          required
          size="small"
          sx={{ width: 136 }}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Финансовые поля */}
        <TextField
          label="Долг, ₽"
          name="principal"
          required
          size="small"
          sx={{ width: 120 }}
          slotProps={decimalSlot}
        />

        <TextField
          label="Накоп. %, ₽"
          name="accruedInterest"
          size="small"
          sx={{ width: 110 }}
          slotProps={decimalSlot}
        />

        <TextField
          label="Ставка, %/день"
          name="interest"
          required
          size="small"
          sx={{ width: 118 }}
          slotProps={decimalSlot}
        />

        {/* Даты */}
        <DatePicker
          label="Открыт"
          format="DD.MM.YYYY"
          defaultValue={dayjs()}
          disableFuture
          name="createdDate"
          slotProps={datePickerSlot("Открыт", true, 140)}
        />

        <DatePicker
          label="След. платёж"
          format="DD.MM.YYYY"
          name="nextPaymentDate"
          defaultValue={dayjs().add(32, "day")}
          slotProps={datePickerSlot("След. платёж", true, 140)}
        />

        <DatePicker
          label="Посл. платёж"
          format="DD.MM.YYYY"
          name="lastPaymentDate"
          slotProps={datePickerSlot("Посл. платёж", false, 140)}
        />

        <Button
          type="submit"
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
          sx={{ height: 34, flexShrink: 0, alignSelf: "flex-end" }}
        >
          Добавить
        </Button>
      </Stack>

      {/* Хинт для обязательных полей */}
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: "block" }}>
        * обязательные поля
      </Typography>
    </Box>
  );
}
