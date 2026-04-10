import { date, integer, pgTable, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

export const debtorsTable = pgTable("debtors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar({ length: 255 }).notNull().unique(),
  status: varchar({ length: 50 }).notNull(),
  created_date: date("created_date", { mode: "string" }).notNull(),
  closed_date: date("closed_date", { mode: "string" }),
  last_payment_date: date("last_payment_date", { mode: "string" }),
  next_payment_date: date("next_payment_date", { mode: "string" }).notNull(),
  /** Основной долг, ₽ */
  principal: numeric({ precision: 14, scale: 2 }).notNull(),
  /** Процентная ставка, % в ДЕНЬ (например: 0.5 = 0.5%/день) */
  interest: numeric({ precision: 8, scale: 4 }),
  /** Накопленные проценты перенесённые из предыдущего периода, ₽ (целые рубли) */
  accrued_interest: numeric({ precision: 14, scale: 2 }),
});

export const paymentsTable = pgTable("payments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  debtor_id: integer("debtor_id").notNull().references(() => debtorsTable.id, { onDelete: "cascade" }),
  amount: numeric({ precision: 14, scale: 2 }).notNull(),
  paid_at: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  note: varchar({ length: 500 }),
});

export type InsertDebtor = typeof debtorsTable.$inferInsert;
export type Debtor = typeof debtorsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
export type Payment = typeof paymentsTable.$inferSelect;
