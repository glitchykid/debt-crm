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

  const columns: GridColDef<Debtor>[] = [
    {
      field: "fullname",
      headerName: "ФИО",
      minWidth: 180,
      flex: 2,
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
          sx={{ fontSize: 12 }}
        />
      ),
    },
    {
      field: "principal",
      headerName: "Долг, ₽",
      width: 130,
      type: "number",
      valueFormatter: (v) => fmtMoney(parseFloat(v as string)),
    },
    {
      field: "_accrued",
      headerName: "Накоплено %, ₽",
      width: 150,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) =>
        accruedInterest(parseFloat(row.principal), parseFloat(row.interest ?? "0"), debtorDays(row)),
      valueFormatter: (v) => fmtMoney(v as number),
    },
    {
      field: "_total",
      headerName: "Итого, ₽",
      width: 140,
      type: "number",
      sortable: false,
      valueGetter: (_v, row) =>
        totalDebt(parseFloat(row.principal), parseFloat(row.interest ?? "0"), debtorDays(row)),
      valueFormatter: (v) => fmtMoney(v as number),
    },
    {
      field: "next_payment_date",
      headerName: "Следующий платёж",
      width: 155,
      valueFormatter: (v) => fmtDate(v as string),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <GridActionsCell {...params}>
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="Открыть"
            onClick={() =>
              window.open(`/debtors/${params.row.id}`, "_blank", "noopener,noreferrer")
            }
          />
          <GridActionsCellItem
            icon={<DeleteIcon fontSize="small" color="error" />}
            label="Удалить"
            onClick={handleDelete(params.row.id)}
          />
        </GridActionsCell>
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
        sx={{
          border: 0,
          flex: 1,
          "& .MuiDataGrid-columnHeaders": { fontSize: 12 },
          "& .MuiDataGrid-cell": { fontSize: 13 },
        }}
      />
    </Box>
  );
}
