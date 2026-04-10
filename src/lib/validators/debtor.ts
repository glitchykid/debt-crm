import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function parseAnyDate(value: unknown): string | null {
  if (!value || value === "") return null;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const [d, m, y] = s.split(".");
    return `${y}-${m}-${d}`;
  }
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

const optionalDecimal = z
  .string()
  .optional()
  .refine(
    (v) => !v || v === "" || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0),
    "Некорректное значение",
  );

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
  // Ставка — обязательна
  interest: z
    .string()
    .min(1, "Укажите процентную ставку")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Ставка должна быть больше 0",
    ),
  accruedInterest: optionalDecimal,
  closedDate: optionalDbDate,
  lastPaymentDate: optionalDbDate,
});

export type CreateDebtorInput = z.infer<typeof createDebtorSchema>;
