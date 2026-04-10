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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { type Debtor, type Payment } from "@/lib/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useState, useMemo, useTransition } from "react";
import {
  accruedInterest,
  totalDebt,
  dailyInterestRub,
  afterPayment,
  suggestRoundUp,
  fmtMoney,
  fmtRub,
  nextPaymentDayLabel,
} from "@/lib/interest";
import { addPaymentAction } from "@/actions/debtors";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";

dayjs.locale("ru");

interface DebtorInfoProps {
  debtor: Debtor;
  payments: Payment[];
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

function fmtDateTime(s: Date | string | null | undefined): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY HH:mm");
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
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" py={0.35}>
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

export function DebtorInfo({ debtor, payments }: DebtorInfoProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const principal = parseFloat(debtor.principal);
  const dailyRate = parseFloat(debtor.interest ?? "0");
  const storedAccrued = parseFloat(debtor.accrued_interest ?? "0");
  const daysOpen = dayjs().diff(dayjs(debtor.created_date), "day");

  const daily = dailyInterestRub(principal, dailyRate);
  const newlyAccrued = accruedInterest(principal, dailyRate, daysOpen);
  const totalAccrued = storedAccrued + newlyAccrued;
  const total = totalDebt(principal, dailyRate, daysOpen, storedAccrued);

  // Через 32 дня от сегодня
  const in32 = principal + storedAccrued + daily * (daysOpen + 32);

  // Следующий платёж — день недели
  const nextPaymentLabel = nextPaymentDayLabel(debtor.next_payment_date);

  // Калькулятор
  const [paymentStr, setPaymentStr] = useState("");
  const [noteStr, setNoteStr] = useState("");
  const payment = Math.floor(parseFloat(paymentStr) || 0); // платёж только целые рубли

  const calc = useMemo(() => {
    if (payment <= 0) return null;
    const result = afterPayment(principal, dailyRate, daysOpen, payment, storedAccrued);
    const newDaily = dailyInterestRub(result.newPrincipal, dailyRate);
    const week = accruedInterest(result.newPrincipal, dailyRate, 7);
    const month = accruedInterest(result.newPrincipal, dailyRate, 30);
    const roundUp = suggestRoundUp(principal, dailyRate, daysOpen, payment, storedAccrued);
    return { ...result, newDaily, week, month, roundUp };
  }, [payment, principal, dailyRate, daysOpen, storedAccrued]);

  const handlePayment = () => {
    if (payment <= 0) return;
    startTransition(async () => {
      const result = await addPaymentAction(debtor.id, payment, noteStr || undefined);
      if (!result.success) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }
      enqueueSnackbar(`Платёж ${fmtRub(payment)} сохранён`, { variant: "success" });
      setPaymentStr("");
      setNoteStr("");
      router.refresh();
    });
  };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, maxWidth: 640, mx: "auto" }}>
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
          <Row
            label="Следующий платёж"
            value={
              <Stack direction="row" spacing={1} alignItems="baseline">
                <span>{fmtDate(debtor.next_payment_date)}</span>
                {nextPaymentLabel && (
                  <Typography variant="caption" color="text.secondary">
                    {nextPaymentLabel}
                  </Typography>
                )}
              </Stack>
            }
          />
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
          <Row label="% в день" value={dailyRate > 0 ? fmtRub(daily) : "—"} />
          {storedAccrued > 0 && (
            <Row label="Перенесённые %" value={fmtRub(storedAccrued)} />
          )}
          <Row
            label={`Накоплено за ${daysOpen} дн.`}
            value={dailyRate > 0 ? fmtRub(newlyAccrued) : "—"}
          />
          {(storedAccrued > 0 || newlyAccrued > 0) && (
            <Row label="Всего процентов" value={fmtRub(totalAccrued)} />
          )}
          <Divider sx={{ my: 0.5 }} />
          <Row label="Итого (долг + %)" value={fmtRub(total)} bold accent />
          <Row
            label="Итого через 32 дня"
            value={dailyRate > 0 ? fmtRub(in32) : fmtRub(principal)}
          />
        </Paper>

        {/* Калькулятор платежа */}
        <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
          <SectionLabel>Внести платёж</SectionLabel>
          <Divider sx={{ mb: 1 }} />

          <Stack spacing={1} sx={{ mb: 1 }}>
            <TextField
              label="Сумма, ₽ (целые рубли)"
              value={paymentStr}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, "");
                setPaymentStr(v);
              }}
              size="small"
              fullWidth
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">₽</InputAdornment> },
                inputLabel: { shrink: true },
              }}
              inputMode="numeric"
            />
            <TextField
              label="Комментарий (необязательно)"
              value={noteStr}
              onChange={(e) => setNoteStr(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          {calc && (
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              <Stack>
                <Row label="Погашено процентов" value={fmtRub(calc.paidAccrued)} />
                <Row label="Погашено долга" value={fmtRub(calc.paidPrincipal)} />
                <Row
                  label="Остаток долга"
                  value={fmtRub(calc.newPrincipal)}
                  bold={calc.newPrincipal === 0}
                  accent={calc.newPrincipal === 0}
                />
                {calc.remainder > 0 && (
                  <Row label="Переплата" value={fmtRub(calc.remainder)} />
                )}
              </Stack>

              {calc.newPrincipal > 0 && dailyRate > 0 && (
                <>
                  <Divider />
                  <Stack>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.25}>
                      Проценты на остаток
                    </Typography>
                    <Row label="В день" value={fmtRub(calc.newDaily)} />
                    <Row label="За 7 дней" value={fmtRub(calc.week)} />
                    <Row label="За 30 дней" value={fmtRub(calc.month)} />
                  </Stack>
                </>
              )}

              {calc.roundUp !== null && calc.roundUp > 0 && (
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
                        onClick={() => setPaymentStr(String(payment + calc.roundUp!))}
                      >
                        +{calc.roundUp} ₽
                      </Button>
                    }
                  >
                    Доплатите <strong>{calc.roundUp} ₽</strong> — % в день снизятся на 1 ₽.
                  </Alert>
                </>
              )}

              {calc.newPrincipal === 0 && (
                <Alert severity="success" sx={{ py: 0.25, fontSize: 12 }}>
                  Долг будет полностью погашен
                </Alert>
              )}
            </Stack>
          )}

          <Button
            variant="contained"
            disableElevation
            size="small"
            disabled={payment <= 0}
            onClick={handlePayment}
          >
            Сохранить платёж
          </Button>
        </Paper>

        {/* История платежей */}
        {payments.length > 0 && (
          <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
            <SectionLabel>История платежей</SectionLabel>
            <Divider sx={{ mb: 0.5 }} />
            <Table size="small" sx={{ "& td, & th": { px: 0, py: 0.5, border: 0 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Дата и время
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Сумма
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Комментарий
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Typography variant="body2">{fmtDateTime(p.paid_at)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {fmtRub(parseFloat(p.amount))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {p.note ?? "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {payments.length === 0 && (
          <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
            Платежей ещё не было
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
