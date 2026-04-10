import { db } from "@/lib/db";
import { debtorsTable, type InsertDebtor } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getAllDebtors() {
  // coalesce защищает от ситуации когда колонка accrued_interest ещё не добавлена в БД
  return db
    .select({
      id: debtorsTable.id,
      fullname: debtorsTable.fullname,
      status: debtorsTable.status,
      created_date: debtorsTable.created_date,
      closed_date: debtorsTable.closed_date,
      last_payment_date: debtorsTable.last_payment_date,
      next_payment_date: debtorsTable.next_payment_date,
      principal: debtorsTable.principal,
      interest: debtorsTable.interest,
      accrued_interest: sql<string | null>`coalesce(${debtorsTable.accrued_interest}, null)`,
    })
    .from(debtorsTable);
}

export async function getDebtorById(id: number) {
  const [debtor] = await db
    .select()
    .from(debtorsTable)
    .where(eq(debtorsTable.id, id));
  return debtor ?? null;
}

export async function createDebtor(data: InsertDebtor) {
  const [newDebtor] = await db.insert(debtorsTable).values(data).returning();
  return newDebtor;
}

export async function deleteDebtorById(id: number) {
  await db.delete(debtorsTable).where(eq(debtorsTable.id, id));
}
