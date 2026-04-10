import { Container, Typography, Paper, Stack, Divider, Chip } from "@mui/material";
import { fetchDebtorByIdAction } from "@/actions/debtors";
import { notFound } from "next/navigation";

interface DebtorInfoProps {
  id: string;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  Активен: "success",
  "Передан в суд": "error",
  Просрочен: "warning",
  Закрыт: "default",
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={500}>{value ?? "—"}</Typography>
    </Stack>
  );
}

export async function DebtorInfo({ id }: DebtorInfoProps) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();

  const debtor = await fetchDebtorByIdAction(numericId);
  if (!debtor) notFound();

  const statusColor = STATUS_COLOR[debtor.status] ?? "default";

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" component="h1" fontWeight="bold" flex={1}>
            {debtor.fullname}
          </Typography>
          <Chip label={debtor.status} color={statusColor} size="small" />
        </Stack>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} divider={<Divider />}>
            <Row label="Основная сумма" value={debtor.principal} />
            <Row label="Проценты" value={debtor.interest} />
            <Row label="Дата создания" value={debtor.created_date} />
            <Row label="Дата закрытия" value={debtor.closed_date} />
            <Row label="Последний платёж" value={debtor.last_payment_date} />
            <Row label="Следующий платёж" value={debtor.next_payment_date} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
