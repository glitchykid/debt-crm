/**
 * Утилиты расчёта простых процентов.
 * Ставка хранится как % в ДЕНЬ (поле interest в БД).
 * Формула: сумма_процентов = principal × (rate / 100) × days
 */

/** Процентов за 1 день, ₽ */
export function dailyInterestAmount(principal: number, dailyRatePct: number): number {
  if (!dailyRatePct || !principal) return 0;
  return principal * (dailyRatePct / 100);
}

/** Накопленные проценты за N дней, ₽ */
export function accruedInterest(principal: number, dailyRatePct: number, days: number): number {
  return dailyInterestAmount(principal, dailyRatePct) * Math.max(0, days);
}

/** Итого (основной долг + накопленные проценты), ₽ */
export function totalDebt(principal: number, dailyRatePct: number, days: number): number {
  return principal + accruedInterest(principal, dailyRatePct, days);
}

/**
 * После платежа payment: какой останется principal (проценты гасятся первыми).
 * Возвращает { newPrincipal, remainder } где remainder — сдача (payment > total).
 */
export function afterPayment(
  principal: number,
  dailyRatePct: number,
  days: number,
  payment: number,
): { newPrincipal: number; remainder: number; accrued: number } {
  const accrued = accruedInterest(principal, dailyRatePct, days);
  const total = principal + accrued;
  const paid = Math.min(payment, total);
  const leftoverPrincipal = Math.max(0, total - paid);
  const remainder = Math.max(0, payment - total);
  return { newPrincipal: leftoverPrincipal, remainder, accrued };
}

/**
 * Минимальная доплата δ такая, что (principal + accrued + δ) кратно 1 копейке без хвоста,
 * и ежедневные проценты от нового остатка дают целые копейки.
 *
 * Алгоритм: ищем ближайший newPrincipal >= 0 такой, что
 *   newPrincipal * (rate/100) * 100  — целое (т.е. нет долей копейки в день).
 * Проверяем до 200 копеек вверх.
 */
export function suggestRoundUp(
  principal: number,
  dailyRatePct: number,
  days: number,
  currentPayment: number,
): number | null {
  if (!dailyRatePct) return null;
  const accrued = accruedInterest(principal, dailyRatePct, days);
  const total = principal + accrued;
  const paid = currentPayment;
  if (paid >= total) return null;

  const remaining = total - paid; // остаток основного долга после платежа
  // Ищем минимальную доплату δ ∈ [0, 200 коп] такую, что
  // (remaining - δ) * rate/100 не имеет дробных копеек
  for (let delta100 = 0; delta100 <= 20000; delta100++) {
    const delta = delta100 / 100;
    const newPrincipal = remaining - delta;
    if (newPrincipal < 0) break;
    const dailyKopecks = newPrincipal * (dailyRatePct / 100) * 100;
    if (Math.abs(dailyKopecks - Math.round(dailyKopecks)) < 0.0001) {
      return delta > 0 ? delta : null;
    }
  }
  return null;
}

export function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
