"use client";

import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const rows: GridRowsProp = [
  { id: 1, fullname: "Никита Миронов Алексеевич", desc: "Это я" },
];

const columns: GridColDef[] = [
  { field: "fullname", headerName: "Имя", width: 300 },
  { field: "status", headerName: "Статус", width: 100 },
  { field: "last_payment_date", headerName: "Последний платёж", width: 150 },
  { field: "next_payment_date", headerName: "Следующий платёж", width: 150 },
  { field: "debtor_created_date", headerName: "Дата создания", width: 150 },
  { field: "debtor_closed_date", headerName: "Дата закрытия", width: 150 },
];

export default function Debtors() {
  return (
    <Box style={{ height: "100%", width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
}
