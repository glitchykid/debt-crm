import { Debtor } from "@/components/Debtor";

export default async function DebtorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <Debtor id={id} />
    </main>
  );
}
