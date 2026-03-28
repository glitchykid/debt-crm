"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, Snackbar, Alert, IconButton } from "@mui/material";
import { deleteDebtorAction, fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";
import DeleteIcon from "@mui/icons-material/Delete";

export function DebtorsDataGrid({ refreshTrigger }: { refreshTrigger: number }) {
  const [rows, setRows] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

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
    const result = await deleteDebtorAction(id);

    if (result.error) {
      setSnackbarMessage(result.error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    } else {
      setSnackbarMessage("Должник успешно удален!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      await loadData();
    }
  };

  const handleCloseSnackbar = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
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
        <IconButton aria-label="Удалить" color="error" onClick={handleDeleteClick(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box style={{ height: "100%", width: "100%" }}>
      <DataGrid
        disableRowSelectionOnClick
        loading={loading}
        rows={rows}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        sx={{
          border: 0,
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
