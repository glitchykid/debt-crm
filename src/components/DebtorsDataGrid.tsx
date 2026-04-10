"use client";

import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MutableRefObject,
} from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { accruedInterest, totalDebt, fmtMoney } from "@/lib/interest";
import { useRouter } from "next/navigation";

interface DebtorsDataGridProps {
  onReloadRef?: MutableRefObject<(() => void) | null>;
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY");
}

// Статус → chip цвет + метка
const STATUS_META: Record<string, { color: "success" | "warning" | "error" | "default"; label: string }> = {
  "Активен":       { color: "success", label: "Активен" },
  "Передан в суд": { color: "error",   label: "В суде" },
  "Просрочен":     { color: "warning", label: "Просрочен" },
  "Закрыт":        { color: "default", label: "Закрыт" },
};

function debtorDays(row: Debtor): number {
  return Math.max(0, dayjs().diff(dayjs(row.created_date), "day"));
}

// Форматирование числа как ₽ без дробной части (для вычисленных колонок)
function fmtRubInt(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function DebtorsDataGrid({ onReloadRef }: DebtorsDataGridProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [rows, setRows] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDebtorsAction();
      setRows(data);
    } catch {
      enqueueSnackbar("Не удалось загрузить список должников", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { if (onReloadRef) onReloadRef.current = loadData; }, [onReloadRef, loadData]);

  const handleDelete = (id: number) => () => {
    if (!window.confirm("Удалить должника?")) return;
    startTransition(async () => {
      setLoading(true);
      const result = await deleteDebtorAction(id);
      if (!result.success) {
        enqueueSnackbar(result.error, { variant: "error" });
        setLoading(false);
        return;
      }
      enqueueSnackbar("Удалено", { variant: "success" });
      await loadData();
    });
  };

  const columns: GridColDef<Debtor>[] = [
    {
      field: "fullname",
      headerName: "ФИО",
      width: 230,
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          sx={{
            cursor: "pointer",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => router.push(`/debtors/${p.row.id}`)}
        >
          {p.value as string}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Статус",
      width: 120,
      renderCell: (p: GridRenderCellParams<Debtor>) => {
        const meta = STATUS_META[p.value as string] ?? { color: "default", label: p.value as string };
        return (
          <Chip
            label={meta.label}
            color={meta.color}
            size="small"
          />
        );
      },
    },
    {
      field: "principal",
      headerName: "Основной долг",
      width: 140,
      type: "number",
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Typography variant="body2" fontWeight={500} sx={{ fontVariantNumeric: "tabular-nums" }}>
          {fmtMoney(parseFloat(p.value as string))} ₽
        </Typography>
      ),
    },
    {
      field: "interest",
      headerName: "Ставка",
      width: 90,
      type: "number",
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {p.value ? `${p.value}%` : "—"}
        </Typography>
      ),
    },
    {
      field: "_accrued",
      headerName: "Накоплено %",
      width: 140,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) => {
        const stored = parseFloat(row.accrued_interest ?? "0");
        const daily = accruedInterest(parseFloat(row.principal), parseFloat(row.interest ?? "0"), debtorDays(row));
        return stored + daily;
      },
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmtRubInt(p.value as number)} ₽
        </Typography>
      ),
    },
    {
      field: "_total",
      headerName: "Итого",
      width: 140,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) =>
        totalDebt(
          parseFloat(row.principal),
          parseFloat(row.interest ?? "0"),
          debtorDays(row),
          parseFloat(row.accrued_interest ?? "0"),
        ),
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Typography
          variant="body2"
          fontWeight={600}
          color="error.main"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmtRubInt(p.value as number)} ₽
        </Typography>
      ),
    },
    {
      field: "next_payment_date",
      headerName: "След. платёж",
      width: 125,
      renderCell: (p: GridRenderCellParams<Debtor>) => {
        const v = p.value as string | null;
        if (!v) return <Typography variant="body2" color="text.disabled">—</Typography>;
        const isOverdue = dayjs(v).isBefore(dayjs(), "day");
        return (
          <Typography
            variant="body2"
            color={isOverdue ? "error.main" : "text.secondary"}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmtDate(v)}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 76,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Debtor>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Tooltip title="Открыть">
            <IconButton
              size="small"
              onClick={() => router.push(`/debtors/${params.row.id}`)}
              sx={{ color: "text.secondary" }}
            >
              <OpenInNewIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              onClick={handleDelete(params.row.id)}
              sx={(theme) => ({
                color: "text.disabled",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              })}
            >
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <DataGrid
        loading={loading}
        rows={rows}
        columns={columns}
        sx={{ border: 0, flex: 1 }}
      />
    </Box>
  );
}
