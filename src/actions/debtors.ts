"use server";

import { revalidatePath } from "next/cache";
import {
  getAllDebtors,
  createDebtor,
  deleteDebtorById,
  getDebtorById,
  getPaymentsByDebtorId,
  addPayment,
} from "@/lib/db/queries/debtors";
import { createDebtorSchema } from "@/lib/validators/debtor";
import { type Debtor, type Payment } from "@/lib/db/schema";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function fetchDebtorsAction(): Promise<Debtor[]> {
  try {
    return await getAllDebtors();
  } catch (err) {
    console.error("fetchDebtorsAction error:", err);
    return [];
  }
}

export async function fetchDebtorByIdAction(id: number) {
  try {
    return await getDebtorById(id);
  } catch {
    throw new Error("Не удалось получить данные о должнике");
  }
}

export async function fetchPaymentsAction(debtorId: number): Promise<Payment[]> {
  try {
    return await getPaymentsByDebtorId(debtorId);
  } catch {
    return [];
  }
}

export async function addPaymentAction(
  debtorId: number,
  amount: number,
  note?: string,
): Promise<ActionResult> {
  if (amount <= 0) return { success: false, error: "Сумма должна быть больше 0" };
  try {
    await addPayment({ debtor_id: debtorId, amount, note });
    revalidatePath(`/debtors/${debtorId}`);
    return { success: true };
  } catch (err) {
    console.error("addPaymentAction error:", err);
    return { success: false, error: "Не удалось сохранить платёж" };
  }
}

export async function createDebtorAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    fullname: formData.get("fullname"),
    status: formData.get("status"),
    createdDate: formData.get("createdDate"),
    nextPaymentDate: formData.get("nextPaymentDate"),
    principal: formData.get("principal"),
    interest: formData.get("interest") ?? undefined,
    accruedInterest: formData.get("accruedInterest") ?? undefined,
    closedDate: formData.get("closedDate") ?? undefined,
    lastPaymentDate: formData.get("lastPaymentDate") ?? undefined,
  };

  const parsed = createDebtorSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Ошибка валидации";
    return { success: false, error: message };
  }

  const {
    fullname, status, createdDate, nextPaymentDate,
    principal, interest, accruedInterest, closedDate, lastPaymentDate,
  } = parsed.data;

  try {
    await createDebtor({
      fullname,
      status,
      created_date: createdDate,
      next_payment_date: nextPaymentDate,
      principal,
      interest,
      accrued_interest: accruedInterest && accruedInterest !== "" ? accruedInterest : null,
      closed_date: closedDate ?? null,
      last_payment_date: lastPaymentDate ?? null,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("createDebtorAction DB error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return { success: false, error: "Должник с таким ФИО уже существует" };
    }
    return { success: false, error: `Ошибка БД: ${msg}` };
  }
}

export async function deleteDebtorAction(id: number): Promise<ActionResult> {
  try {
    await deleteDebtorById(id);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Не удалось удалить должника" };
  }
}
