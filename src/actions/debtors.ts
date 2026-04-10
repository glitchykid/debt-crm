"use server";

import { revalidatePath } from "next/cache";
import {
  getAllDebtors,
  createDebtor,
  deleteDebtorById,
  getDebtorById,
} from "@/lib/db/queries/debtors";
import { createDebtorSchema, toDbDate } from "@/lib/validators/debtor";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function fetchDebtorsAction() {
  try {
    return await getAllDebtors();
  } catch {
    throw new Error("Не удалось получить данные");
  }
}

export async function fetchDebtorByIdAction(id: number) {
  try {
    return await getDebtorById(id);
  } catch {
    throw new Error("Не удалось получить данные о должнике");
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
    closedDate: formData.get("closedDate") ?? undefined,
    lastPaymentDate: formData.get("lastPaymentDate") ?? undefined,
  };

  const parsed = createDebtorSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Ошибка валидации";
    return { success: false, error: message };
  }

  const {
    fullname,
    status,
    createdDate,
    nextPaymentDate,
    principal,
    interest,
    closedDate,
    lastPaymentDate,
  } = parsed.data;

  try {
    await createDebtor({
      fullname,
      status,
      created_date: toDbDate(createdDate),
      next_payment_date: toDbDate(nextPaymentDate),
      principal,
      interest: interest && interest !== "" ? interest : null,
      closed_date: closedDate ? toDbDate(closedDate) : null,
      last_payment_date: lastPaymentDate ? toDbDate(lastPaymentDate) : null,
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Должник с таким ФИО уже существует" };
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
