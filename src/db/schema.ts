import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const debtorsTable = pgTable("debtors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar({ length: 255 }).notNull().unique(),
  status: varchar({ length: 255 }).notNull(),
  created_date: date().notNull(),
  closed_date: date(),
  last_payment_date: date(),
  next_payment_date: date().notNull(),
});
