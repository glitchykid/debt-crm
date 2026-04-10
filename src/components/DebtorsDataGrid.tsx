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
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { accruedInterest, totalDebt, fmtMoney } from "@/lib/interest";

interface DebtorsDataGridProps {
  onReloadRef?: MutableRefObject<(() => void) | null>;
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return dayjs(s).format("DD.MM.YYYY");
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  Активен: "success",
  "Передан в суд": "error",
  Просрочен: "warning",
  Закрыт: "default",
};

function debtorDays(row: Debtor): number {
  return dayjs().diff(dayjs(row.created_date), "day");
}

export function DebtorsDataGrid({ onReloadRef }: DebtorsDataGridProps) {
  const { enqueueSnackbar } = useSnackbar();
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

  // Все колонки с явной шириной — таблица не прыгает при загрузке
  const columns: GridColDef<Debtor>[] = [
    {
      field: "fullname",
      headerName: "ФИО",
      width: 220,
    },
    {
      field: "status",
      headerName: "Статус",
      width: 130,
      renderCell: (p: GridRenderCellParams<Debtor>) => (
        <Chip
          label={p.value as string}
          color={STATUS_COLOR[p.value as string] ?? "default"}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11, height: 20 }}
        />
      ),
    },
    {
      field: "principal",
      headerName: "Долг, ₽",
      width: 120,
      type: "number",
      valueFormatter: (v) => fmtMoney(parseFloat(v as string)),
    },
    {
      field: "interest",
      headerName: "Ставка, %/д",
      width: 110,
      type: "number",
      valueFormatter: (v) => (v ? `${v}%` : "—"),
    },
    {
      field: "_accrued",
      headerName: "Накоплено %, ₽",
      width: 145,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) => {
        const stored = parseFloat(row.accrued_interest ?? "0");
        const daily = accruedInterest(parseFloat(row.principal), parseFloat(row.interest ?? "0"), debtorDays(row));
        return stored + daily;
      },
      valueFormatter: (v) => fmtMoney(v as number),
    },
    {
      field: "_total",
      headerName: "Итого, ₽",
      width: 130,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) =>
        totalDebt(
          parseFloat(row.principal),
          parseFloat(row.interest ?? "0"),
          debtorDays(row),
          parseFloat(row.accrued_interest ?? "0"),
        ),
      valueFormatter: (v) => fmtMoney(v as number),
    },
    {
      field: "next_payment_date",
      headerName: "След. платёж",
      width: 125,
      valueFormatter: (v) => fmtDate(v as string),
    },
    {
      field: "actions",
      headerName: "",
      width: 72,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Debtor>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Открыть">
            <IconButton
              size="small"
              onClick={() =>
                window.open(`/debtors/${params.row.id}`, "_blank", "noopener,noreferrer")
              }
              sx={{ color: "text.secondary" }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              onClick={handleDelete(params.row.id)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <DataGrid
        disableRowSelectionOnClick
        loading={loading}
        rows={rows}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        density="compact"
        autoPageSize
        sx={{
          border: 0,
          flex: 1,
          // Фиксируем минимальную ширину колонок — ширина не скачет
          "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },
          "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
            fontSize: 13,
            outline: "none !important",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
          },
        }}
      />
    </Box>
  );
}
