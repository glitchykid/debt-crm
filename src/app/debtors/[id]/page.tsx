import { DebtorInfo } from "@/components/DebtorInfo";
import { fetchDebtorByIdAction } from "@/actions/debtors";
import { notFound } from "next/navigation";

export default async function DebtorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();

  const debtor = await fetchDebtorByIdAction(numericId);
  if (!debtor) notFound();

  return <DebtorInfo debtor={debtor} />;
}
