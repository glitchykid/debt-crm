"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridActionsCellItem, GridActionsCell } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { enqueueSnackbar } from "notistack";

export function DebtorsDataGrid({ refreshTrigger }: { refreshTrigger: number }) {
  const [rows, setRows] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDebtorsAction();
      setRows(data);
    } catch (err) {
      console.error("Ошибка при загрузке:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [refreshTrigger]);

  const handleDeleteClick = (id: number) => async () => {
    const isConfirmed = window.confirm("Вы уверены, что хотите удалить этого должника?");
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const result = await deleteDebtorAction(id);
      if (result?.error) {
        enqueueSnackbar(result.error, {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar("Должник успешно удалён!", {
        variant: "success",
      });
      await loadData();
    } catch (error) {
      enqueueSnackbar("Произошла системная ошибка сети", {
        variant: "error",
      });
      console.log("Системная ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewClick = (id: number) => async () => {
    const url = `/debtors/${id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns: GridColDef<Debtor>[] = [
    { field: "fullname", headerName: "Имя", width: 300 },
    { field: "status", headerName: "Статус", flex: 1 },
    { field: "last_payment_date", headerName: "Последний платёж", flex: 1 },
    { field: "next_payment_date", headerName: "Следующий платёж", flex: 1 },
    { field: "created_date", headerName: "Дата создания", flex: 1 },
    { field: "closed_date", headerName: "Дата закрытия", flex: 1 },
    {
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
            onClick={handleOpenInNewClick(params.row.id)}
          />
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Удалить"
            onClick={handleDeleteClick(params.row.id)}
          />
        </GridActionsCell>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
