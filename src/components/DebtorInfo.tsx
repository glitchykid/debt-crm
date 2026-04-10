"use client";

import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { type Debtor } from "@/lib/db/schema";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

interface DebtorInfoProps {
  debtor: Debtor;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  Активен: "success",
  "Передан в суд": "error",
  Просрочен: "warning",
  Закрыт: "default",
};

function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export function DebtorInfo({ debtor }: DebtorInfoProps) {
  const principal = parseFloat(debtor.principal);
  const annualRate = parseFloat(debtor.interest ?? "0");

  // Дни с открытия до сегодня
  const daysOpen = dayjs().diff(dayjs(debtor.created_date), "day");

  // Простые проценты: principal × rate/100 × days/365
  const dailyInterest = annualRate > 0 ? principal * (annualRate / 100) / 365 : 0;
  const accruedInterest = dailyInterest * daysOpen;
  const total = principal + accruedInterest;
  const in32days = principal + dailyInterest * (daysOpen + 32);

  // Форма внесения платежа
  const [paymentStr, setPaymentStr] = useState("");
  const payment = parseFloat(paymentStr) || 0;

  const afterPayment = useMemo(() => {
    if (payment <= 0) return null;
    const remaining = Math.max(0, total - payment);
    return remaining;
  }, [total, payment]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 3,
        maxWidth: 720,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        {/* Шапка */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" fontWeight={600} flex={1}>
            {debtor.fullname}
          </Typography>
          <Chip
            label={debtor.status}
            color={STATUS_COLOR[debtor.status] ?? "default"}
            size="small"
          />
        </Stack>

        {/* Основная информация */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            Данные по договору
          </Typography>
          <Stack spacing={1} divider={<Divider />}>
            <InfoRow label="Дата открытия" value={fmtDate(debtor.created_date)} />
            <InfoRow label="Дата закрытия" value={fmtDate(debtor.closed_date)} />
            <InfoRow label="Предыдущий платёж" value={fmtDate(debtor.last_payment_date)} />
            <InfoRow label="Следующий платёж" value={fmtDate(debtor.next_payment_date)} />
          </Stack>
        </Paper>

        {/* Финансовый блок */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            Финансовый расчёт
          </Typography>
          <Stack spacing={1} divider={<Divider />}>
            <InfoRow
              label="Основной долг"
              value={`${fmtMoney(principal)} ₽`}
            />
            <InfoRow
              label="Процентная ставка"
              value={annualRate > 0 ? `${annualRate}% / год` : "—"}
            />
            <InfoRow
              label="Процентов в день"
              value={annualRate > 0 ? `${fmtMoney(dailyInterest)} ₽` : "—"}
            />
            <InfoRow
              label={`Накоплено процентов (${daysOpen} дн.)`}
              value={annualRate > 0 ? `${fmtMoney(accruedInterest)} ₽` : "—"}
            />
            <InfoRow
              label="Итого (долг + %)"
              value={
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {fmtMoney(total)} ₽
                </Typography>
              }
            />
            <InfoRow
              label="Итого через 32 дня"
              value={annualRate > 0 ? `${fmtMoney(in32days)} ₽` : `${fmtMoney(principal)} ₽`}
            />
          </Stack>
        </Paper>

        {/* Форма внесения платежа */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            Расчёт платежа
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Сумма платежа"
              value={paymentStr}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(v)) setPaymentStr(v);
              }}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                },
                inputLabel: { shrink: true },
              }}
              inputMode="decimal"
              helperText="Введите сумму, чтобы увидеть остаток"
            />

            {afterPayment !== null && (
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Остаток после платежа
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={afterPayment === 0 ? "success.main" : "text.primary"}
                  >
                    {fmtMoney(afterPayment)} ₽
                  </Typography>
                </Stack>
                {afterPayment === 0 && (
                  <Typography variant="caption" color="success.main">
                    Долг полностью погашен
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
