/**
 * TDD: Zod-схема валидации — тестируем граничные случаи.
 */

import { createDebtorSchema, toDbDate } from "@/lib/validators/debtor";

describe("createDebtorSchema", () => {
  const valid = {
    fullname: "Иванов Иван",
    status: "Активен" as const,
    createdDate: "10.04.2026",
    nextPaymentDate: "10.05.2026",
    principal: "50000",
  };

  it("принимает корректные данные", () => {
    expect(createDebtorSchema.safeParse(valid).success).toBe(true);
  });

  it("принимает все допустимые статусы", () => {
    const statuses = ["Активен", "Передан в суд", "Просрочен", "Закрыт"] as const;
    for (const status of statuses) {
      expect(createDebtorSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });

  it("отклоняет недопустимый статус", () => {
    expect(
      createDebtorSchema.safeParse({ ...valid, status: "Неизвестный" }).success,
    ).toBe(false);
  });

  it("отклоняет дату в неверном формате", () => {
    expect(
      createDebtorSchema.safeParse({ ...valid, createdDate: "2026-04-10" }).success,
    ).toBe(false);
  });

  it("отклоняет пустое ФИО", () => {
    expect(createDebtorSchema.safeParse({ ...valid, fullname: "" }).success).toBe(false);
  });

  it("отклоняет отрицательную сумму", () => {
    expect(createDebtorSchema.safeParse({ ...valid, principal: "-1" }).success).toBe(false);
  });

  it("принимает опциональные поля", () => {
    const result = createDebtorSchema.safeParse({
      ...valid,
      interest: "5.5",
      closedDate: "01.01.2027",
      lastPaymentDate: "01.04.2026",
    });
    expect(result.success).toBe(true);
  });
});

describe("toDbDate", () => {
  it("конвертирует DD.MM.YYYY → YYYY-MM-DD", () => {
    expect(toDbDate("10.04.2026")).toBe("2026-04-10");
    expect(toDbDate("01.01.2000")).toBe("2000-01-01");
  });
});
