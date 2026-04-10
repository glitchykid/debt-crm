"use client";

import {
  Alert,
  Box,
  Button,
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
import {
  accruedInterest,
  totalDebt,
  dailyInterestAmount,
  afterPayment,
  suggestRoundUp,
  fmtMoney,
} from "@/lib/interest";

interface DebtorInfoProps {
  debtor: Debtor;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  Активен: "success",
  "Передан в суд": "error",
  Просрочен: "warning",
  Закрыт: "default",
};

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY");
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" py={0.4}>
      <Typography variant="body2" color="text.secondary" sx={{ pr: 2, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 500}
        color={accent ? "primary.main" : "text.primary"}
        noWrap
      >
        {value}
      </Typography>
    </Stack>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      fontWeight={600}
      color="text.disabled"
      letterSpacing={0.8}
      display="block"
      sx={{ textTransform: "uppercase", mb: 0.5 }}
    >
      {children}
    </Typography>
  );
}

export function DebtorInfo({ debtor }: DebtorInfoProps) {
  const principal = parseFloat(debtor.principal);
  const dailyRate = parseFloat(debtor.interest ?? "0");
  const storedAccrued = parseFloat(debtor.accrued_interest ?? "0");

  const daysOpen = dayjs().diff(dayjs(debtor.created_date), "day");

  const daily = dailyInterestAmount(principal, dailyRate);
  const newlyAccrued = accruedInterest(principal, dailyRate, daysOpen);
  const totalAccrued = storedAccrued + newlyAccrued;
  const total = totalDebt(principal, dailyRate, daysOpen, storedAccrued);
  const in32 = principal + storedAccrued + daily * (daysOpen + 32);

  // Калькулятор
  const [paymentStr, setPaymentStr] = useState("");
  const payment = parseFloat(paymentStr) || 0;

  const calc = useMemo(() => {
    if (payment <= 0) return null;

    const { newPrincipal, remainder, totalAccrued: ta } = afterPayment(
      principal, dailyRate, daysOpen, payment, storedAccrued,
    );

    const newDaily = dailyInterestAmount(newPrincipal, dailyRate);
    const hasFractions = dailyRate > 0 && Math.abs(newDaily * 100 - Math.round(newDaily * 100)) > 0.001;

    const week = accruedInterest(newPrincipal, dailyRate, 7);
    const month = accruedInterest(newPrincipal, dailyRate, 30);

    const roundUp = hasFractions
      ? suggestRoundUp(principal, dailyRate, daysOpen, payment, storedAccrued)
      : null;

    return { newPrincipal, remainder, ta, newDaily, hasFractions, week, month, roundUp };
  }, [payment, principal, dailyRate, daysOpen, storedAccrued]);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, maxWidth: 600, mx: "auto" }}>
      <Stack spacing={2}>
        {/* Заголовок */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h6" fontWeight={700} flex={1} lineHeight={1.3}>
            {debtor.fullname}
          </Typography>
          <Chip
            label={debtor.status}
            color={STATUS_COLOR[debtor.status] ?? "default"}
            size="small"
          />
        </Stack>

        {/* Даты */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <SectionLabel>Даты</SectionLabel>
          <Divider sx={{ mb: 0.5 }} />
          <Row label="Открыт" value={fmtDate(debtor.created_date)} />
          <Row label="Предыдущий платёж" value={fmtDate(debtor.last_payment_date)} />
          <Row label="Следующий платёж" value={fmtDate(debtor.next_payment_date)} />
          {debtor.closed_date && (
            <Row label="Закрыт" value={fmtDate(debtor.closed_date)} />
          )}
        </Paper>

        {/* Финансы */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <SectionLabel>Расчёт на сегодня</SectionLabel>
          <Divider sx={{ mb: 0.5 }} />
          <Row label="Основной долг" value={`${fmtMoney(principal)} ₽`} />
          <Row label="Ставка" value={dailyRate > 0 ? `${dailyRate}% / день` : "—"} />
          <Row label="% в день" value={dailyRate > 0 ? `${fmtMoney(daily)} ₽` : "—"} />
          {storedAccrued > 0 && (
            <Row label="Перенесённые %" value={`${fmtMoney(storedAccrued)} ₽`} />
          )}
          <Row
            label={`Накоплено за ${daysOpen} дн.`}
            value={dailyRate > 0 ? `${fmtMoney(newlyAccrued)} ₽` : "—"}
          />
          {storedAccrued > 0 && (
            <Row label="Всего процентов" value={`${fmtMoney(totalAccrued)} ₽`} />
          )}
          <Divider sx={{ my: 0.5 }} />
          <Row label="Итого (долг + %)" value={`${fmtMoney(total)} ₽`} bold accent />
          <Row
            label="Итого через 32 дня"
            value={dailyRate > 0 ? `${fmtMoney(in32)} ₽` : `${fmtMoney(principal)} ₽`}
          />
        </Paper>

        {/* Калькулятор */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <SectionLabel>Калькулятор платежа</SectionLabel>
          <Divider sx={{ mb: 1 }} />

          <TextField
            label="Сумма платежа"
            value={paymentStr}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(v)) setPaymentStr(v);
            }}
            size="small"
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              },
              inputLabel: { shrink: true },
            }}
            inputMode="decimal"
            sx={{ mb: 1 }}
          />

          {calc && (
            <Stack spacing={1}>
              <Stack>
                <Row
                  label="Погашено процентов"
                  value={`${fmtMoney(Math.min(calc.ta, payment))} ₽`}
                />
                <Row
                  label="Остаток долга"
                  value={`${fmtMoney(calc.newPrincipal)} ₽`}
                  bold={calc.newPrincipal === 0}
                  accent={calc.newPrincipal === 0}
                />
                {calc.remainder > 0 && (
                  <Row label="Переплата" value={`${fmtMoney(calc.remainder)} ₽`} />
                )}
              </Stack>

              {calc.newPrincipal > 0 && dailyRate > 0 && (
                <>
                  <Divider />
                  <Stack>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.25}>
                      Проценты на остаток
                    </Typography>
                    <Row label="В день" value={`${fmtMoney(calc.newDaily)} ₽`} />
                    <Row label="За 7 дней" value={`${fmtMoney(calc.week)} ₽`} />
                    <Row label="За 30 дней" value={`${fmtMoney(calc.month)} ₽`} />
                  </Stack>
                </>
              )}

              {calc.hasFractions && calc.roundUp !== null && (
                <>
                  <Divider />
                  <Alert
                    severity="info"
                    sx={{ py: 0.25, fontSize: 12 }}
                    action={
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11, whiteSpace: "nowrap" }}
                        onClick={() => {
                          setPaymentStr((payment + calc.roundUp!).toFixed(2));
                        }}
                      >
                        +{fmtMoney(calc.roundUp)} ₽
                      </Button>
                    }
                  >
                    Доплатите <strong>{fmtMoney(calc.roundUp)} ₽</strong> — проценты
                    будут без долей копейки.
                  </Alert>
                </>
              )}

              {calc.newPrincipal === 0 && (
                <Alert severity="success" sx={{ py: 0.25, fontSize: 12 }}>
                  Долг полностью погашен
                </Alert>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
