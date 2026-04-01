import { Debtor } from "@/components/Debtor";

export default async function DebtorPage({ params }: { params: Promise<{ id: string }> }) {
  // Распаковываем Promise на уровне страницы
  const { id } = await params;

  return (
    <main>
      {/* Передаем чистую строку */}
      <Debtor id={id} />
    </main>
  );
}
