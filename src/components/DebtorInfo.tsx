"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { type Debtor, type Payment } from "@/lib/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useState, useMemo, useTransition } from "react";
import {
  accruedInterest,
  totalDebt,
  dailyInterestAmount,
  afterPayment,
  calcRoundUpPayment,
  fmtMoney,
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

// Статус-цвет
const STATUS_META: Record<string, "success" | "warning" | "error" | "default"> = {
  "Активен":       "success",
  "Передан в суд": "error",
  "Просрочен":     "warning",
  "Закрыт":        "default",
};

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY");
}

function fmtDateTime(s: Date | string | null | undefined): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY HH:mm");
}

// ─── Переиспользуемые компоненты ─────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 1 }}>
      {children}
    </Typography>
  );
}

function MetaRow({
  label,
  value,
  bold,
  accent,
  color,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  accent?: boolean;
  color?: string;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      sx={{ py: 0.4, "&:not(:last-child)": {} }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, pr: 2 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 600 : 400}
        color={accent ? "primary.main" : (color ?? "text.primary")}
        sx={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function InfoPanel({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export function DebtorInfo({ debtor, payments }: DebtorInfoProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const principal = parseFloat(debtor.principal);
  const dailyRate = parseFloat(debtor.interest ?? "0");
  const storedAccrued = parseFloat(debtor.accrued_interest ?? "0");
  const daysOpen = Math.max(0, dayjs().diff(dayjs(debtor.created_date), "day"));

  const daily = dailyInterestAmount(principal, dailyRate);
  const newlyAccrued = accruedInterest(principal, dailyRate, daysOpen);
  const totalAccrued = storedAccrued + newlyAccrued;
  const total = totalDebt(principal, dailyRate, daysOpen, storedAccrued);
  const in32 = principal + storedAccrued + daily * (daysOpen + 32);
  const nextPaymentLabel = nextPaymentDayLabel(debtor.next_payment_date);

  const [paymentStr, setPaymentStr] = useState("");
  const [noteStr, setNoteStr] = useState("");
  const payment = parseFloat(paymentStr) || 0;

  const calc = useMemo(() => {
    if (payment <= 0) return null;
    const result = afterPayment(principal, dailyRate, daysOpen, payment, storedAccrued);
    const newDaily = dailyInterestAmount(result.newPrincipal, dailyRate);
    const newAccrued7 = accruedInterest(result.newPrincipal, dailyRate, 7);
    const newAccrued30 = accruedInterest(result.newPrincipal, dailyRate, 30);
    const roundUp = calcRoundUpPayment(principal, dailyRate, daysOpen, payment, storedAccrued);
    return { ...result, newDaily, newAccrued7, newAccrued30, roundUp };
  }, [payment, principal, dailyRate, daysOpen, storedAccrued]);

  const handlePayment = () => {
    if (payment <= 0) return;
    startTransition(async () => {
      const result = await addPaymentAction(debtor.id, payment, noteStr || undefined);
      if (!result.success) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }
      enqueueSnackbar(`Платёж ${fmtMoney(payment)} ₽ сохранён`, { variant: "success" });
      setPaymentStr("");
      setNoteStr("");
      router.refresh();
    });
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2.5,
        maxWidth: 800,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Кнопка назад */}
      <Box sx={{ mb: 2 }}>
        <Tooltip title="Назад к списку">
          <IconButton size="small" onClick={() => router.push("/")} sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Заголовок должника ── */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom={false}>
            {debtor.fullname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`ID #${debtor.id} · открыт ${fmtDate(debtor.created_date)}`}
          </Typography>
        </Box>
        <Chip
          label={debtor.status}
          color={STATUS_META[debtor.status] ?? "default"}
          size="small"
        />
      </Stack>

      <Stack spacing={2}>
        {/* ── Строка: финансы + даты ── */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

          {/* Финансовая сводка */}
          <InfoPanel sx={{ flex: 1 }}>
            <SectionTitle>Расчёт на сегодня</SectionTitle>
            <MetaRow label="Основной долг"     value={`${fmtMoney(principal)} ₽`} bold />
            <MetaRow label="Ставка"             value={dailyRate > 0 ? `${dailyRate}% / день` : "—"} />
            <MetaRow label="% в день"           value={dailyRate > 0 ? `${fmtMoney(daily)} ₽` : "—"} />
            {storedAccrued > 0 && (
              <MetaRow label="Перенесённые %"   value={`${fmtMoney(storedAccrued)} ₽`} />
            )}
            <MetaRow
              label={`За ${daysOpen} дн.`}
              value={dailyRate > 0 ? `${fmtMoney(newlyAccrued)} ₽` : "—"}
            />
            {totalAccrued > 0 && (
              <MetaRow label="Всего %"           value={`${fmtMoney(totalAccrued)} ₽`} color="warning.main" />
            )}
            <Divider sx={{ my: 0.75 }} />
            <MetaRow
              label="Итого (долг + %)"
              value={`${fmtMoney(total)} ₽`}
              bold
              accent
            />
            <MetaRow
              label="Через 32 дня"
              value={dailyRate > 0 ? `${fmtMoney(in32)} ₽` : `${fmtMoney(principal)} ₽`}
              color="text.secondary"
            />
          </InfoPanel>

          {/* Даты */}
          <InfoPanel sx={{ minWidth: 220 }}>
            <SectionTitle>Даты</SectionTitle>
            <MetaRow label="Открыт"              value={fmtDate(debtor.created_date)} />
            <MetaRow label="Предыдущий платёж"   value={fmtDate(debtor.last_payment_date)} />
            <MetaRow
              label="Следующий платёж"
              value={
                <Box>
                  <span>{fmtDate(debtor.next_payment_date)}</span>
                  {nextPaymentLabel && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {nextPaymentLabel}
                    </Typography>
                  )}
                </Box>
              }
            />
            {debtor.closed_date && (
              <MetaRow label="Закрыт" value={fmtDate(debtor.closed_date)} />
            )}
          </InfoPanel>
        </Stack>

        {/* ── Калькулятор платежа ── */}
        <InfoPanel>
          <SectionTitle>Внести платёж</SectionTitle>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField
              label="Сумма платежа, ₽"
              value={paymentStr}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(v)) setPaymentStr(v);
              }}
              size="small"
              sx={{ maxWidth: 200 }}
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">₽</InputAdornment> },
                inputLabel: { shrink: true },
              }}
              inputMode="decimal"
              placeholder="0.00"
            />
            <TextField
              label="Комментарий"
              value={noteStr}
              onChange={(e) => setNoteStr(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              slotProps={{ inputLabel: { shrink: true } }}
              placeholder="необязательно"
            />
            <Button
              variant="contained"
              size="small"
              disabled={payment <= 0}
              onClick={handlePayment}
              sx={{ alignSelf: "flex-end", height: 34, flexShrink: 0 }}
            >
              Сохранить
            </Button>
          </Stack>

          {/* Расчёт платежа */}
          {calc && (
            <Box
              sx={(theme) => ({
                borderRadius: 1,
                border: "1px solid",
                borderColor: theme.palette.divider,
                overflow: "hidden",
              })}
            >
              {/* Разбивка платежа */}
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 0.75 }}>
                  Разбивка
                </Typography>
                <Stack spacing={0}>
                  <MetaRow label="Погашено %"    value={`${fmtMoney(calc.paidAccrued)} ₽`} />
                  <MetaRow label="Погашено долга" value={`${fmtMoney(calc.paidPrincipal)} ₽`} />
                  <MetaRow
                    label="Остаток долга"
                    value={`${fmtMoney(calc.newPrincipal)} ₽`}
                    bold
                    color={calc.newPrincipal === 0 ? "success.main" : "text.primary"}
                  />
                  {calc.remainder > 0 && (
                    <MetaRow label="Переплата" value={`${fmtMoney(calc.remainder)} ₽`} color="text.secondary" />
                  )}
                </Stack>
              </Box>

              {/* Проценты на остаток */}
              {calc.newPrincipal > 0 && dailyRate > 0 && (
                <>
                  <Divider />
                  <Box sx={{ px: 1.5, py: 1 }}>
                    <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 0.75 }}>
                      Проценты на остаток
                    </Typography>
                    <MetaRow label="% в день"  value={`${fmtMoney(calc.newDaily)} ₽`} color="warning.main" />
                    <MetaRow label="За 7 дней" value={`${fmtMoney(calc.newAccrued7)} ₽`} />
                    <MetaRow label="За 30 дней" value={`${fmtMoney(calc.newAccrued30)} ₽`} />
                  </Box>
                </>
              )}

              {/* Подсказка: округление */}
              {calc.roundUp && (
                <>
                  <Divider />
                  <Box
                    sx={(theme) => ({
                      px: 1.5,
                      py: 1,
                      backgroundColor: alpha(theme.palette.warning.main, 0.06),
                    })}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" color="warning.main" fontWeight={600}>
                          Копейки в % в день
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                          Доплата{" "}
                          <strong>{fmtMoney(calc.roundUp.delta)} ₽</strong> → остаток{" "}
                          <strong>{fmtMoney(calc.roundUp.roundedPrincipal)} ₽</strong>,
                          % в день = <strong>{calc.roundUp.roundedDaily} ₽ ровно</strong>
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{ ml: 1.5, whiteSpace: "nowrap", flexShrink: 0, fontSize: "0.6875rem", height: 26 }}
                        onClick={() =>
                          setPaymentStr((payment + calc.roundUp!.delta).toFixed(2))
                        }
                      >
                        + {fmtMoney(calc.roundUp.delta)} ₽
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}

              {/* Полное погашение */}
              {calc.newPrincipal === 0 && (
                <>
                  <Divider />
                  <Alert
                    severity="success"
                    sx={{ borderRadius: 0, border: 0, py: 0.5 }}
                  >
                    Долг будет полностью погашен
                  </Alert>
                </>
              )}
            </Box>
          )}
        </InfoPanel>

        {/* ── История платежей ── */}
        <InfoPanel>
          <SectionTitle>История платежей</SectionTitle>

          {payments.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 0.5 }}>
              Платежей ещё не было
            </Typography>
          ) : (
            <Table
              size="small"
              sx={{
                "& td, & th": { px: 0, border: 0 },
                "& tr:not(:last-child) td": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 0.5, pb: 1 }}>Дата и время</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, pb: 1 }}>Сумма</TableCell>
                  <TableCell sx={{ py: 0.5, pb: 1, pl: "12px !important" }}>Комментарий</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ py: 0.75 }}>
                      <Typography variant="body2" color="text.secondary">
                        {fmtDateTime(p.paid_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.75 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {fmtMoney(parseFloat(p.amount))} ₽
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, pl: "12px !important" }}>
                      <Typography variant="body2" color="text.secondary">
                        {p.note ?? "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </InfoPanel>
      </Stack>
    </Box>
  );
}
