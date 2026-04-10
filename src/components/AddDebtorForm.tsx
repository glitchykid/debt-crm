"use client";

import { createDebtorAction } from "@/actions/debtors";
import {
  Box,
  Button,
  TextField,
  Stack,
  MenuItem,
  Divider,
  Typography,
} from "@mui/material";
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
  const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", ".", ","];
  if (!allowed.includes(e.key) && isNaN(Number(e.key))) {
    e.preventDefault();
  }
}

const decimalSlotProps = {
  inputLabel: { shrink: true },
  htmlInput: {
    inputMode: "decimal" as const,
    pattern: "[0-9]*\\.?[0-9]{0,2}",
    onKeyDown: allowDecimalOnly,
  },
};

export default function AddDebtorForm({ onSuccess }: { onSuccess: () => void }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async (formData: FormData) => {
    const result = await createDebtorAction(formData);
    if (!result.success) {
      enqueueSnackbar(result.error, { variant: "error" });
      return;
    }
    enqueueSnackbar("Должник успешно добавлен!", { variant: "success" });
    onSuccess();
  };

  return (
    <Box component="form" action={handleAction}>
      <Stack spacing={3}>
        {/* Группа 1: основные данные */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField
            label="ФИО"
            name="fullname"
            required
            sx={{ minWidth: 220 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            select
            label="Статус"
            name="status"
            defaultValue="Активен"
            required
            sx={{ minWidth: 160 }}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Основная сумма"
            name="principal"
            required
            sx={{ minWidth: 160 }}
            slotProps={decimalSlotProps}
          />

          <TextField
            label="Процентная ставка, % / год"
            name="interest"
            sx={{ minWidth: 200 }}
            slotProps={decimalSlotProps}
          />
        </Stack>

        <Divider>
          <Typography variant="caption" color="text.secondary">
            Даты
          </Typography>
        </Divider>

        {/* Группа 2: даты */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <DatePicker
            label="Дата открытия"
            format="DD.MM.YYYY"
            defaultValue={dayjs()}
            disableFuture
            name="createdDate"
            slotProps={{
              textField: { required: true, InputLabelProps: { shrink: true } },
            }}
          />

          <DatePicker
            label="Следующий платёж"
            format="DD.MM.YYYY"
            name="nextPaymentDate"
            defaultValue={dayjs().add(32, "day")}
            slotProps={{
              textField: { required: true, InputLabelProps: { shrink: true } },
            }}
          />

          <DatePicker
            label="Последний платёж"
            format="DD.MM.YYYY"
            name="lastPaymentDate"
            slotProps={{
              textField: { InputLabelProps: { shrink: true } },
            }}
          />

          <DatePicker
            label="Дата закрытия"
            format="DD.MM.YYYY"
            name="closedDate"
            slotProps={{
              textField: { InputLabelProps: { shrink: true } },
            }}
          />
        </Stack>

        <Box>
          <Button type="submit" variant="contained" disableElevation>
            Добавить должника
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
