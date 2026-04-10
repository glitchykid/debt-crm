import { db } from "@/lib/db";
import { debtorsTable, type InsertDebtor, type Debtor } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

/**
 * Получаем всех должников.
 * Делаем raw SELECT чтобы устойчиво обрабатывать ситуацию когда
 * колонка accrued_interest ещё не добавлена в БД (миграция не применена).
 */
export async function getAllDebtors(): Promise<Debtor[]> {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT
      id,
      fullname,
      status,
      created_date,
      closed_date,
      last_payment_date,
      next_payment_date,
      principal,
      interest,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'debtors' AND column_name = 'accrued_interest'
        )
        THEN accrued_interest::text
        ELSE NULL
      END AS accrued_interest
    FROM debtors
    ORDER BY id DESC
  `;

  return rows as unknown as Debtor[];
}

export async function getDebtorById(id: number) {
  const [debtor] = await db
    .select()
    .from(debtorsTable)
    .where(eq(debtorsTable.id, id));
  return debtor ?? null;
}

export async function createDebtor(data: InsertDebtor) {
  // Если колонка accrued_interest не существует — вставляем без неё
  const sql = neon(process.env.DATABASE_URL!);

  const hasColumn = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debtors' AND column_name = 'accrued_interest'
    LIMIT 1
  `;

  if (hasColumn.length === 0) {
    // Вставляем без accrued_interest
    const { accrued_interest, ...rest } = data;
    const [newDebtor] = await db.insert(debtorsTable).values(rest as InsertDebtor).returning();
    return newDebtor;
  }

  const [newDebtor] = await db.insert(debtorsTable).values(data).returning();
  return newDebtor;
}

export async function deleteDebtorById(id: number) {
  await db.delete(debtorsTable).where(eq(debtorsTable.id, id));
}
