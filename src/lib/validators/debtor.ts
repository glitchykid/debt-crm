import { z } from "zod";

// Формат даты из DatePicker MUI: DD.MM.YYYY
const dateString = z
  .string()
  .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Неверный формат даты (ожидается ДД.ММ.ГГГГ)");

const optionalDateString = z
  .string()
  .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Неверный формат даты (ожидается ДД.ММ.ГГГГ)")
  .nullable()
  .optional();

export const createDebtorSchema = z.object({
  fullname: z.string().min(1, "ФИО обязательно"),
  status: z.enum(["Активен", "Передан в суд", "Просрочен", "Закрыт"], {
    errorMap: () => ({ message: "Недопустимый статус" }),
  }),
  createdDate: dateString,
  nextPaymentDate: dateString,
  principal: z
    .string()
    .min(1, "Основная сумма обязательна")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Сумма должна быть положительным числом"),
  interest: z
    .string()
    .refine((v) => v === "" || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0), "Некорректный процент")
    .optional(),
  closedDate: optionalDateString,
  lastPaymentDate: optionalDateString,
});

export type CreateDebtorInput = z.infer<typeof createDebtorSchema>;

/** Конвертирует дату из DD.MM.YYYY в YYYY-MM-DD для Postgres */
export function toDbDate(dateString: string): string {
  const [day, month, year] = dateString.split(".");
  return `${year}-${month}-${day}`;
}
