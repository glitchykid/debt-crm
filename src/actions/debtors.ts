"use server";

import { getAllDebtors, createDebtor, deleteDebtorById } from "@/lib/db/queries/debtors";

export async function fetchDebtorsAction() {
  try {
    return await getAllDebtors();
  } catch (error) {
    console.error("Ошибка при получении должников:", error);
    throw new Error("Не удалось получить данные");
  }
}

function formatToDBDate(dateString: string | null): string {
  if (!dateString) return "";
  const parts = dateString.split(".");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export async function createDebtorAction(formData: FormData) {
  const fullname = formData.get("fullname") as string;
  const status = formData.get("status") as string;
  const rawCreatedDate = formData.get("createdDate") as string;
  const rawNextPaymentDate = formData.get("nextPaymentDate") as string;
  const createdDate = formatToDBDate(rawCreatedDate);
  const nextPaymentDate = formatToDBDate(rawNextPaymentDate);

  if (!fullname || !status || !createdDate || !nextPaymentDate) {
    return { error: "Заполните все обязательные поля." };
  }

  try {
    await createDebtor({
      fullname,
      status: status,
      created_date: createdDate,
      closed_date: null,
      last_payment_date: null,
      next_payment_date: nextPaymentDate,
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка при добавлении должника:", error);
    return { error: "Должник с таким ФИО уже существует" };
  }
}

export async function deleteDebtorAction(id: number) {
  try {
    await deleteDebtorById(id);
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении должника:", error);
    return { error: "Не удалось удалить должника" };
  }
}
