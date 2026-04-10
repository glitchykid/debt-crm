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
  GridActionsCellItem,
  GridActionsCell,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box, Chip } from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

interface DebtorsDataGridProps {
  onReloadRef?: MutableRefObject<(() => void) | null>;
}

// Сумма накопленных простых процентов
function calcAccruedInterest(debtor: Debtor): number {
  const rate = parseFloat(debtor.interest ?? "0");
  const principal = parseFloat(debtor.principal);
  if (!rate || !principal || !debtor.created_date) return 0;
  const days = dayjs().diff(dayjs(debtor.created_date), "day");
  return principal * (rate / 100) * (days / 365);
}

function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (onReloadRef) onReloadRef.current = loadData;
  }, [onReloadRef, loadData]);

  const handleDeleteClick = (id: number) => () => {
    if (!window.confirm("Удалить должника?")) return;
    startTransition(async () => {
      setLoading(true);
      const result = await deleteDebtorAction(id);
      if (!result.success) {
        enqueueSnackbar(result.error, { variant: "error" });
        setLoading(false);
        return;
      }
      enqueueSnackbar("Должник удалён", { variant: "success" });
      await loadData();
    });
  };

  const columns: GridColDef<Debtor>[] = [
    {
      field: "fullname",
      headerName: "ФИО",
      width: 220,
      minWidth: 160,
    },
    {
      field: "status",
      headerName: "Статус",
      width: 140,
      renderCell: (params: GridRenderCellParams<Debtor>) => (
        <Chip
          label={params.value as string}
          color={STATUS_COLOR[params.value as string] ?? "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "principal",
      headerName: "Основной долг",
      width: 150,
      type: "number",
      valueFormatter: (value) => fmtMoney(parseFloat(value as string)),
    },
    {
      field: "_accrued",
      headerName: "Накоплено %",
      width: 140,
      type: "number",
      sortable: false,
      valueGetter: (_value, row) => calcAccruedInterest(row),
      valueFormatter: (value) => fmtMoney(value as number),
    },
    {
      field: "_total",
      headerName: "Итого (долг + %)",
      width: 160,
      type: "number",
      sortable: false,
      valueGetter: (_value, row) =>
        parseFloat(row.principal) + calcAccruedInterest(row),
      valueFormatter: (value) => fmtMoney(value as number),
    },
    {
      field: "next_payment_date",
      headerName: "Следующий платёж",
      width: 160,
      valueFormatter: (value) => fmtDate(value as string),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Действия",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <GridActionsCell {...params}>
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="Открыть"
            onClick={() => window.open(`/debtors/${params.row.id}`, "_blank", "noopener,noreferrer")}
          />
          <GridActionsCellItem
            icon={<DeleteIcon fontSize="small" color="error" />}
            label="Удалить"
            onClick={handleDeleteClick(params.row.id)}
          />
        </GridActionsCell>
      ),
    },
  ];

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <DataGrid
        disableRowSelectionOnClick
        loading={loading}
        rows={rows}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        sx={{ border: 0, flex: 1 }}
      />
    </Box>
  );
}
