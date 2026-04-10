import { date, integer, pgTable, varchar, numeric } from "drizzle-orm/pg-core";

export const debtorsTable = pgTable("debtors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar({ length: 255 }).notNull().unique(),
  status: varchar({ length: 255 }).notNull(),
  created_date: date("created_date", { mode: "string" }).notNull(),
  closed_date: date("closed_date", { mode: "string" }),
  last_payment_date: date("last_payment_date", { mode: "string" }),
  next_payment_date: date("next_payment_date", { mode: "string" }).notNull(),
  principal: numeric({ precision: 12, scale: 2 }).notNull(),
  interest: numeric({ precision: 5, scale: 2 }),
});

export type InsertDebtor = typeof debtorsTable.$inferInsert;
export type Debtor = typeof debtorsTable.$inferSelect;
