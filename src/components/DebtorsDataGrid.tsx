"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { fetchDebtorsAction } from "@/actions/debtors";
import { type Debtor } from "@/lib/db/schema";

const columns: GridColDef<Debtor>[] = [
  { field: "fullname", headerName: "Имя", width: 300, resizable: false },
  { field: "status", headerName: "Статус", flex: 1, resizable: false },
  { field: "last_payment_date", headerName: "Последний платёж", flex: 1, resizable: false },
  { field: "next_payment_date", headerName: "Следующий платёж", flex: 1, resizable: false },
  { field: "created_date", headerName: "Дата создания", flex: 1, resizable: false },
  { field: "closed_date", headerName: "Дата закрытия", flex: 1, resizable: false },
];

export function DebtorsDataGrid({ refreshTrigger }: { refreshTrigger: number }) {
  const [rows, setRows] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDebtorsAction();
        setRows(data);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshTrigger]);

  return (
    <Box style={{ height: "100%", width: "100%" }}>
      <DataGrid
        disableRowSelectionOnClick
        loading={loading}
        rows={rows}
        columns={columns}
        sx={{
          border: 0,
        }}
      />
    </Box>
  );
}
