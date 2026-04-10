import { date, integer, pgTable, varchar, numeric } from "drizzle-orm/pg-core";

export const debtorsTable = pgTable("debtors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar({ length: 255 }).notNull().unique(),
  status: varchar({ length: 50 }).notNull(),
  created_date: date("created_date", { mode: "string" }).notNull(),
  closed_date: date("closed_date", { mode: "string" }),
  last_payment_date: date("last_payment_date", { mode: "string" }),
  next_payment_date: date("next_payment_date", { mode: "string" }).notNull(),
  principal: numeric({ precision: 14, scale: 2 }).notNull(),
  /** Процентная ставка в % в ДЕНЬ (например: 0.5 = 0.5% в день) */
  interest: numeric({ precision: 8, scale: 4 }),
});

export type InsertDebtor = typeof debtorsTable.$inferInsert;
export type Debtor = typeof debtorsTable.$inferSelect;
