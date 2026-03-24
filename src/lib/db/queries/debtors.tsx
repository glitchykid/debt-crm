import { db } from "@/lib/db";
import { debtorsTable, InsertDebtor } from "@/lib/db/schema";

export async function getAllDebtors() {
  return db.select().from(debtorsTable);
}

export async function createDebtor(data: InsertDebtor) {
  const [newDebtor] = await db.insert(debtorsTable).values(data).returning();

  return newDebtor;
}
