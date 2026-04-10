/**
 * TDD: Server Actions — тестируем поведение, не детали реализации.
 */

import { createDebtorAction, deleteDebtorAction } from "@/actions/debtors";

jest.mock("@/lib/db/queries/debtors", () => ({
  getAllDebtors: jest.fn(),
  getDebtorById: jest.fn(),
  createDebtor: jest.fn(),
  deleteDebtorById: jest.fn(),
}));

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

// DatePicker передаёт ISO формат
const validFields = {
  fullname: "Иванов Иван Иванович",
  status: "Активен",
  createdDate: "2026-04-10",
  nextPaymentDate: "2026-05-10",
  principal: "50000",
};

describe("createDebtorAction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("возвращает success:true при корректных данных", async () => {
    mockCreateDebtor.mockResolvedValueOnce({ id: 1 });
    const result = await createDebtorAction(buildFormData(validFields));
    expect(result.success).toBe(true);
    expect(mockCreateDebtor).toHaveBeenCalledTimes(1);
  });

  it("передаёт дату в ISO YYYY-MM-DD в БД", async () => {
    mockCreateDebtor.mockResolvedValueOnce({ id: 1 });
    await createDebtorAction(buildFormData(validFields));
    expect(mockCreateDebtor).toHaveBeenCalledWith(
      expect.objectContaining({
        created_date: "2026-04-10",
        next_payment_date: "2026-05-10",
      }),
    );
  });

  it("принимает DD.MM.YYYY и конвертирует в ISO", async () => {
    mockCreateDebtor.mockResolvedValueOnce({ id: 1 });
    await createDebtorAction(
      buildFormData({ ...validFields, createdDate: "10.04.2026" }),
    );
    expect(mockCreateDebtor).toHaveBeenCalledWith(
      expect.objectContaining({ created_date: "2026-04-10" }),
    );
  });

  it("возвращает success:false при пустом fullname", async () => {
    const result = await createDebtorAction(
      buildFormData({ ...validFields, fullname: "" }),
    );
    expect(result.success).toBe(false);
    expect(mockCreateDebtor).not.toHaveBeenCalled();
  });

  it("возвращает success:false при дублировании ФИО (ошибка БД)", async () => {
    mockCreateDebtor.mockRejectedValueOnce(new Error("unique constraint"));
    const result = await createDebtorAction(buildFormData(validFields));
    expect(result.success).toBe(false);
  });
});

describe("deleteDebtorAction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("возвращает success:true при успешном удалении", async () => {
    mockDeleteDebtorById.mockResolvedValueOnce(undefined);
    const result = await deleteDebtorAction(1);
    expect(result.success).toBe(true);
  });

  it("возвращает success:false при ошибке БД", async () => {
    mockDeleteDebtorById.mockRejectedValueOnce(new Error("db error"));
    const result = await deleteDebtorAction(1);
    expect(result.success).toBe(false);
  });
});
