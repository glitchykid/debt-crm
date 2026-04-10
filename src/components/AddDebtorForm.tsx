"use client";

import { createDebtorAction } from "@/actions/debtors";
import { Box, Button, TextField, Stack, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { KeyboardEvent } from "react";

export const STATUS_OPTIONS = [
  { value: "Активен", label: "Активен" },
  { value: "Передан в суд", label: "Передан в суд" },
  { value: "Просрочен", label: "Просрочка" },
  { value: "Закрыт", label: "Закрыт" },
] as const;

function allowDecimalOnly(e: KeyboardEvent<HTMLInputElement>) {
  const ctrl = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", ".", ","];
  if (!ctrl.includes(e.key) && isNaN(Number(e.key))) e.preventDefault();
}

const decimalSlot = {
  inputLabel: { shrink: true },
  htmlInput: { inputMode: "decimal" as const, onKeyDown: allowDecimalOnly },
};

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
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="flex-start">
        {/* ФИО — растягивается */}
        <TextField
          label="ФИО"
          name="fullname"
          required
          size="small"
          sx={{ minWidth: 200, flex: "2 1 200px" }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Статус"
          name="status"
          defaultValue="Активен"
          required
          size="small"
          sx={{ width: 140, flexShrink: 0 }}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Долг, ₽"
          name="principal"
          required
          size="small"
          sx={{ width: 130, flexShrink: 0 }}
          slotProps={decimalSlot}
        />

        <TextField
          label="Накоп. %, ₽"
          name="accruedInterest"
          size="small"
          sx={{ width: 120, flexShrink: 0 }}
          slotProps={decimalSlot}
        />

        <TextField
          label="Ставка, %/день"
          name="interest"
          required
          size="small"
          sx={{ width: 120, flexShrink: 0 }}
          slotProps={decimalSlot}
        />

        <DatePicker
          label="Открыт"
          format="DD.MM.YYYY"
          defaultValue={dayjs()}
          disableFuture
          name="createdDate"
          slotProps={{
            textField: { required: true, size: "small", sx: { width: 148 }, InputLabelProps: { shrink: true } },
          }}
        />

        <DatePicker
          label="След. платёж"
          format="DD.MM.YYYY"
          name="nextPaymentDate"
          defaultValue={dayjs().add(32, "day")}
          slotProps={{
            textField: { required: true, size: "small", sx: { width: 148 }, InputLabelProps: { shrink: true } },
          }}
        />

        <DatePicker
          label="Посл. платёж"
          format="DD.MM.YYYY"
          name="lastPaymentDate"
          slotProps={{
            textField: { size: "small", sx: { width: 148 }, InputLabelProps: { shrink: true } },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disableElevation
          size="small"
          sx={{ height: 40, flexShrink: 0, alignSelf: "flex-start" }}
        >
          Добавить
        </Button>
      </Stack>
    </Box>
  );
}
