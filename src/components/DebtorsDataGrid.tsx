"use client";

import { useEffect, useState, useTransition, useCallback, MutableRefObject } from "react";
import { DataGrid, GridColDef, GridActionsCellItem, GridActionsCell } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSnackbar } from "notistack";

const BASE_COLUMNS: GridColDef<Debtor>[] = [
  { field: "fullname", headerName: "ФИО", width: 300 },
  { field: "status", headerName: "Статус", flex: 1 },
  { field: "principal", headerName: "Сумма", flex: 1 },
  { field: "last_payment_date", headerName: "Последний платёж", flex: 1 },
  { field: "next_payment_date", headerName: "Следующий платёж", flex: 1 },
  { field: "created_date", headerName: "Дата создания", flex: 1 },
  { field: "closed_date", headerName: "Дата закрытия", flex: 1 },
];

interface DebtorsDataGridProps {
  /** Родитель передаёт ref, чтобы вызвать reload() извне */
  onReloadRef?: MutableRefObject<(() => void) | null>;
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

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Пробрасываем reload наружу через ref
  useEffect(() => {
    if (onReloadRef) {
      onReloadRef.current = loadData;
    }
  }, [onReloadRef, loadData]);

  const handleDeleteClick = (id: number) => () => {
    const isConfirmed = window.confirm("Вы уверены, что хотите удалить этого должника?");
    if (!isConfirmed) return;

    startTransition(async () => {
      setLoading(true);
      const result = await deleteDebtorAction(id);
      if (!result.success) {
        enqueueSnackbar(result.error, { variant: "error" });
        setLoading(false);
        return;
      }
      enqueueSnackbar("Должник успешно удалён!", { variant: "success" });
      await loadData();
    });
  };

  const handleOpenClick = (id: number) => () => {
    window.open(`/debtors/${id}`, "_blank", "noopener,noreferrer");
  };

  const actionColumn: GridColDef<Debtor> = {
    field: "actions",
    type: "actions",
    headerName: "Действия",
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <GridActionsCell {...params}>
        <GridActionsCellItem
          icon={<OpenInNewIcon />}
          label="Открыть"
          onClick={handleOpenClick(params.row.id)}
        />
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Удалить"
          onClick={handleDeleteClick(params.row.id)}
        />
      </GridActionsCell>
    ),
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <DataGrid
        disableRowSelectionOnClick
        loading={loading}
        rows={rows}
        columns={[...BASE_COLUMNS, actionColumn]}
        disableColumnMenu
        disableColumnResize
        sx={{ border: 0, flex: 1 }}
      />
    </Box>
  );
}
