import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * MUI DatePicker с name-атрибутом передаёт значение в FormData
 * как строку в формате YYYY-MM-DD (ISO 8601), независимо от display-формата.
 * Принимаем YYYY-MM-DD и любые форматы dayjs умеет распарсить.
 */
function parseAnyDate(value: unknown): string | null {
  if (!value || value === "") return null;
  const s = String(value).trim();

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD.MM.YYYY (ручной ввод)
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const [d, m, y] = s.split(".");
    return `${y}-${m}-${d}`;
  }

  // Пробуем dayjs как последний резерв
  const parsed = dayjs(s);
  if (parsed.isValid()) return parsed.format("YYYY-MM-DD");

  return null;
}

const dbDate = z
  .unknown()
  .transform((v) => parseAnyDate(v))
  .refine((v) => v !== null, { message: "Укажите корректную дату" }) as z.ZodType<string>;

const optionalDbDate = z
  .unknown()
  .transform((v) => parseAnyDate(v))
  .optional();

export const createDebtorSchema = z.object({
  fullname: z.string().min(1, "ФИО обязательно"),
  status: z.enum(["Активен", "Передан в суд", "Просрочен", "Закрыт"], {
    errorMap: () => ({ message: "Недопустимый статус" }),
  }),
  createdDate: dbDate,
  nextPaymentDate: dbDate,
  principal: z
    .string()
    .min(1, "Основная сумма обязательна")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Сумма должна быть положительным числом",
    ),
  interest: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "" || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0),
      "Некорректный процент",
    ),
  closedDate: optionalDbDate,
  lastPaymentDate: optionalDbDate,
});

export type CreateDebtorInput = z.infer<typeof createDebtorSchema>;

/** Значение уже в формате YYYY-MM-DD после трансформации схемой */
export function toDbDate(date: string): string {
  return date;
}
