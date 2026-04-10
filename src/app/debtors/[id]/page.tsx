import { DebtorInfo } from "@/components/DebtorInfo";

export default async function DebtorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <DebtorInfo id={id} />
    </main>
  );
}
