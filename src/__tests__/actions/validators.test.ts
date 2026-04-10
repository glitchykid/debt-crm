/**
 * TDD: Zod-схема валидации — тестируем граничные случаи.
 */

import { createDebtorSchema } from "@/lib/validators/debtor";

describe("createDebtorSchema", () => {
  const valid = {
    fullname: "Иванов Иван",
    status: "Активен" as const,
    // DatePicker передаёт ISO YYYY-MM-DD через FormData
    createdDate: "2026-04-10",
    nextPaymentDate: "2026-05-10",
    principal: "50000",
  };

  it("принимает ISO-даты из DatePicker (YYYY-MM-DD)", () => {
    const result = createDebtorSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdDate).toBe("2026-04-10");
    }
  });

  it("принимает дату в формате DD.MM.YYYY (ручной ввод)", () => {
    const result = createDebtorSchema.safeParse({
      ...valid,
      createdDate: "10.04.2026",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdDate).toBe("2026-04-10");
    }
  });

  it("отклоняет некорректную дату", () => {
    expect(
      createDebtorSchema.safeParse({ ...valid, createdDate: "не-дата" }).success,
    ).toBe(false);
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

  it("отклоняет пустое ФИО", () => {
    expect(createDebtorSchema.safeParse({ ...valid, fullname: "" }).success).toBe(false);
  });

  it("отклоняет отрицательную сумму", () => {
    expect(createDebtorSchema.safeParse({ ...valid, principal: "-1" }).success).toBe(false);
  });

  it("принимает опциональные поля с датами", () => {
    const result = createDebtorSchema.safeParse({
      ...valid,
      interest: "5.5",
      closedDate: "2027-01-01",
      lastPaymentDate: "2026-04-01",
    });
    expect(result.success).toBe(true);
  });
});
