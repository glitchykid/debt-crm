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
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" py={0.5}>
      <Typography variant="body2" color="text.secondary" sx={{ pr: 2 }}>
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

export function DebtorInfo({ debtor }: DebtorInfoProps) {
  const principal = parseFloat(debtor.principal);
  const dailyRate = parseFloat(debtor.interest ?? "0"); // % в день

  const daysOpen = dayjs().diff(dayjs(debtor.created_date), "day");

  const daily = dailyInterestAmount(principal, dailyRate);
  const accrued = accruedInterest(principal, dailyRate, daysOpen);
  const total = totalDebt(principal, dailyRate, daysOpen);
  const in32 = principal + daily * (daysOpen + 32);

  // Калькулятор платежа
  const [paymentStr, setPaymentStr] = useState("");
  const payment = parseFloat(paymentStr) || 0;

  const calc = useMemo(() => {
    if (payment <= 0) return null;
    const { newPrincipal, remainder, accrued: paidAccrued } = afterPayment(
      principal,
      dailyRate,
      daysOpen,
      payment,
    );

    const newDaily = dailyInterestAmount(newPrincipal, dailyRate);
    const newDailyKopecks = Math.round(newDaily * 100) / 100;
    const hasFractions = Math.abs(newDaily * 100 - Math.round(newDaily * 100)) > 0.001;

    // Процентов накопится завтра, через 7, через 30 дней на новый остаток
    const tomorrow = accruedInterest(newPrincipal, dailyRate, 1);
    const week = accruedInterest(newPrincipal, dailyRate, 7);
    const month = accruedInterest(newPrincipal, dailyRate, 30);

    const roundUp = hasFractions
      ? suggestRoundUp(principal, dailyRate, daysOpen, payment)
      : null;

    return {
      newPrincipal,
      remainder,
      paidAccrued,
      newDaily,
      newDailyKopecks,
      hasFractions,
      tomorrow,
      week,
      month,
      roundUp,
    };
  }, [payment, principal, dailyRate, daysOpen]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 3,
        maxWidth: 640,
        mx: "auto",
      }}
    >
      <Stack spacing={2.5}>
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
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
            ДАТЫ
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Row label="Дата открытия" value={fmtDate(debtor.created_date)} />
          <Row label="Предыдущий платёж" value={fmtDate(debtor.last_payment_date)} />
          <Row label="Следующий платёж" value={fmtDate(debtor.next_payment_date)} />
          {debtor.closed_date && (
            <Row label="Дата закрытия" value={fmtDate(debtor.closed_date)} />
          )}
        </Paper>

        {/* Финансы */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
            РАСЧЁТ НА СЕГОДНЯ
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Row label="Основной долг" value={`${fmtMoney(principal)} ₽`} />
          <Row
            label="Ставка"
            value={dailyRate > 0 ? `${dailyRate}% / день` : "—"}
          />
          <Row
            label="Процентов в день"
            value={dailyRate > 0 ? `${fmtMoney(daily)} ₽` : "—"}
          />
          <Row
            label={`Накоплено процентов (${daysOpen} дн.)`}
            value={dailyRate > 0 ? `${fmtMoney(accrued)} ₽` : "—"}
          />
          <Divider sx={{ my: 0.75 }} />
          <Row
            label="Итого (долг + %)"
            value={`${fmtMoney(total)} ₽`}
            bold
            accent
          />
          <Row
            label="Итого через 32 дня"
            value={dailyRate > 0 ? `${fmtMoney(in32)} ₽` : `${fmtMoney(principal)} ₽`}
          />
        </Paper>

        {/* Калькулятор платежа */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
            КАЛЬКУЛЯТОР ПЛАТЕЖА
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

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
            sx={{ mb: 1.5 }}
          />

          {calc && (
            <Stack spacing={1.5}>
              {/* Что платится */}
              <Stack spacing={0}>
                <Row label="Из них погашено % (накоплено)" value={`${fmtMoney(Math.min(calc.paidAccrued, payment))} ₽`} />
                <Row
                  label="Остаток основного долга"
                  value={`${fmtMoney(calc.newPrincipal)} ₽`}
                  bold={calc.newPrincipal === 0}
                  accent={calc.newPrincipal === 0}
                />
                {calc.remainder > 0 && (
                  <Row label="Переплата (сдача)" value={`${fmtMoney(calc.remainder)} ₽`} />
                )}
              </Stack>

              {calc.newPrincipal > 0 && dailyRate > 0 && (
                <>
                  <Divider />
                  {/* Накопление процентов на новый остаток */}
                  <Stack spacing={0}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5}>
                      Процентов на остаток долга
                    </Typography>
                    <Row label="В день" value={`${fmtMoney(calc.newDaily)} ₽`} />
                    <Row label="За 7 дней" value={`${fmtMoney(calc.week)} ₽`} />
                    <Row label="За 30 дней" value={`${fmtMoney(calc.month)} ₽`} />
                  </Stack>
                </>
              )}

              {/* Подсказка про копейки */}
              {calc.hasFractions && calc.roundUp !== null && (
                <>
                  <Divider />
                  <Alert
                    severity="info"
                    sx={{ py: 0.5, fontSize: 13 }}
                    action={
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const suggested = (payment + calc.roundUp!).toFixed(2);
                          setPaymentStr(suggested);
                        }}
                      >
                        +{fmtMoney(calc.roundUp)} ₽
                      </Button>
                    }
                  >
                    Ежедневные проценты будут содержать доли копейки. Доплатите{" "}
                    <strong>{fmtMoney(calc.roundUp)} ₽</strong>, чтобы это исправить.
                  </Alert>
                </>
              )}

              {calc.newPrincipal === 0 && (
                <Alert severity="success" sx={{ py: 0.5, fontSize: 13 }}>
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
