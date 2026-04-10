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

const decimalProps = {
  inputMode: "decimal" as const,
  onKeyDown: allowDecimalOnly,
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
        <TextField
          label="ФИО"
          name="fullname"
          required
          size="small"
          sx={{ minWidth: 200, flex: 2 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Статус"
          name="status"
          defaultValue="Активен"
          required
          size="small"
          sx={{ minWidth: 140 }}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Сумма долга, ₽"
          name="principal"
          required
          size="small"
          sx={{ minWidth: 140 }}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: decimalProps,
          }}
        />

        <TextField
          label="Ставка, % / день"
          name="interest"
          size="small"
          sx={{ minWidth: 130 }}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: decimalProps,
          }}
        />

        <DatePicker
          label="Дата открытия"
          format="DD.MM.YYYY"
          defaultValue={dayjs()}
          disableFuture
          name="createdDate"
          slotProps={{
            textField: { required: true, size: "small", InputLabelProps: { shrink: true } },
          }}
        />

        <DatePicker
          label="След. платёж"
          format="DD.MM.YYYY"
          name="nextPaymentDate"
          defaultValue={dayjs().add(32, "day")}
          slotProps={{
            textField: { required: true, size: "small", InputLabelProps: { shrink: true } },
          }}
        />

        <DatePicker
          label="Посл. платёж"
          format="DD.MM.YYYY"
          name="lastPaymentDate"
          slotProps={{
            textField: { size: "small", InputLabelProps: { shrink: true } },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disableElevation
          size="small"
          sx={{ alignSelf: "flex-start", mt: "1px", height: 40 }}
        >
          Добавить
        </Button>
      </Stack>
    </Box>
  );
}
