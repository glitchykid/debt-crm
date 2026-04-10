import { DebtorInfo } from "@/components/DebtorInfo";
import { fetchDebtorByIdAction, fetchPaymentsAction } from "@/actions/debtors";
import { notFound } from "next/navigation";

export default async function DebtorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();

  const [debtor, payments] = await Promise.all([
    fetchDebtorByIdAction(numericId),
    fetchPaymentsAction(numericId),
  ]);

  if (!debtor) notFound();

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <DebtorInfo debtor={debtor} payments={payments} />
    </div>
  );
}
