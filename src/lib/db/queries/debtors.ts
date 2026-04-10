import { db } from "@/lib/db";
import { debtorsTable, paymentsTable, type InsertDebtor, type Debtor, type Payment } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

export async function getAllDebtors(): Promise<Debtor[]> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT
      id, fullname, status,
      created_date, closed_date, last_payment_date, next_payment_date,
      principal, interest,
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
  const sql = neon(process.env.DATABASE_URL!);

  const hasColumn = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debtors' AND column_name = 'accrued_interest'
    LIMIT 1
  `;

  if (hasColumn.length === 0) {
    const { accrued_interest, ...rest } = data;
    const [d] = await db.insert(debtorsTable).values(rest as InsertDebtor).returning();
    return d;
  }

  const [d] = await db.insert(debtorsTable).values(data).returning();
  return d;
}

export async function deleteDebtorById(id: number) {
  await db.delete(debtorsTable).where(eq(debtorsTable.id, id));
}

export async function getPaymentsByDebtorId(debtorId: number): Promise<Payment[]> {
  return db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.debtor_id, debtorId))
    .orderBy(desc(paymentsTable.paid_at));
}

export async function addPayment(data: { debtor_id: number; amount: number; note?: string }) {
  const [payment] = await db
    .insert(paymentsTable)
    .values({
      debtor_id: data.debtor_id,
      amount: String(data.amount),
      note: data.note ?? null,
    })
    .returning();
  return payment;
}
