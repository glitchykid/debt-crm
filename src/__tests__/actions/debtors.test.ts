/**
 * TDD: Server Actions — тестируем поведение, не детали реализации.
 * Drizzle-запросы замокированы, тестируем:
 *   - Успешное создание должника
 *   - Ошибку валидации Zod
 *   - Ошибку дублирования ФИО
 *   - Успешное удаление
 */

import { createDebtorAction, deleteDebtorAction } from "@/actions/debtors";

// Мокируем весь модуль queries
jest.mock("@/lib/db/queries/debtors", () => ({
  getAllDebtors: jest.fn(),
  getDebtorById: jest.fn(),
  createDebtor: jest.fn(),
  deleteDebtorById: jest.fn(),
}));

// Мокируем revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { createDebtor, deleteDebtorById } from "@/lib/db/queries/debtors";

const mockCreateDebtor = createDebtor as jest.Mock;
const mockDeleteDebtorById = deleteDebtorById as jest.Mock;

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

const validDebtorFields = {
  fullname: "Иванов Иван Иванович",
  status: "Активен",
  createdDate: "10.04.2026",
  nextPaymentDate: "10.05.2026",
  principal: "50000",
};

describe("createDebtorAction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("возвращает success:true при корректных данных", async () => {
    mockCreateDebtor.mockResolvedValueOnce({ id: 1, ...validDebtorFields });

    const result = await createDebtorAction(buildFormData(validDebtorFields));

    expect(result.success).toBe(true);
    expect(mockCreateDebtor).toHaveBeenCalledTimes(1);
  });

  it("возвращает success:false при пустом fullname", async () => {
    const result = await createDebtorAction(
      buildFormData({ ...validDebtorFields, fullname: "" }),
    );

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBeTruthy();
    expect(mockCreateDebtor).not.toHaveBeenCalled();
  });

  it("возвращает success:false при недопустимом статусе", async () => {
    const result = await createDebtorAction(
      buildFormData({ ...validDebtorFields, status: "НеизвестныйСтатус" }),
    );

    expect(result.success).toBe(false);
    expect(mockCreateDebtor).not.toHaveBeenCalled();
  });

  it("возвращает success:false при отрицательной сумме", async () => {
    const result = await createDebtorAction(
      buildFormData({ ...validDebtorFields, principal: "-100" }),
    );

    expect(result.success).toBe(false);
    expect(mockCreateDebtor).not.toHaveBeenCalled();
  });

  it("возвращает success:false при дублировании ФИО (ошибка БД)", async () => {
    mockCreateDebtor.mockRejectedValueOnce(new Error("unique constraint"));

    const result = await createDebtorAction(buildFormData(validDebtorFields));

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("ФИО");
  });

  it("конвертирует дату из DD.MM.YYYY в YYYY-MM-DD при вызове createDebtor", async () => {
    mockCreateDebtor.mockResolvedValueOnce({ id: 2 });

    await createDebtorAction(buildFormData(validDebtorFields));

    expect(mockCreateDebtor).toHaveBeenCalledWith(
      expect.objectContaining({
        created_date: "2026-04-10",
        next_payment_date: "2026-05-10",
      }),
    );
  });
});

describe("deleteDebtorAction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("возвращает success:true при успешном удалении", async () => {
    mockDeleteDebtorById.mockResolvedValueOnce(undefined);

    const result = await deleteDebtorAction(1);

    expect(result.success).toBe(true);
    expect(mockDeleteDebtorById).toHaveBeenCalledWith(1);
  });

  it("возвращает success:false при ошибке БД", async () => {
    mockDeleteDebtorById.mockRejectedValueOnce(new Error("db error"));

    const result = await deleteDebtorAction(1);

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBeTruthy();
  });
});
