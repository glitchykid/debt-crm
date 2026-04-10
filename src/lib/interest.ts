/**
 * Утилиты расчёта простых процентов.
 * Ставка хранится как % в ДЕНЬ (поле interest в БД).
 * Формула: сумма_процентов = principal × (rate / 100) × days
 *
 * В расчётах учитываем accrued_interest — перенесённые проценты из прошлых периодов.
 */

/** Процентов за 1 день, ₽ */
export function dailyInterestAmount(principal: number, dailyRatePct: number): number {
  if (!dailyRatePct || !principal) return 0;
  return principal * (dailyRatePct / 100);
}

/** Накопленные проценты за N дней, ₽ (без учёта перенесённых) */
export function accruedInterest(principal: number, dailyRatePct: number, days: number): number {
  return dailyInterestAmount(principal, dailyRatePct) * Math.max(0, days);
}

/** Итого (основной долг + накопленные проценты + перенесённые %), ₽ */
export function totalDebt(
  principal: number,
  dailyRatePct: number,
  days: number,
  storedAccrued = 0,
): number {
  return principal + storedAccrued + accruedInterest(principal, dailyRatePct, days);
}

/**
 * После платежа: сначала гасятся проценты (накопленные + перенесённые),
 * затем основной долг.
 */
export function afterPayment(
  principal: number,
  dailyRatePct: number,
  days: number,
  payment: number,
  storedAccrued = 0,
): { newPrincipal: number; remainder: number; totalAccrued: number } {
  const totalAccrued = storedAccrued + accruedInterest(principal, dailyRatePct, days);
  const total = principal + totalAccrued;
  const paid = Math.min(payment, total);
  const leftover = Math.max(0, total - paid);
  const remainder = Math.max(0, payment - total);
  return { newPrincipal: leftover, remainder, totalAccrued };
}

/**
 * Минимальная доплата δ такая, что ежедневные проценты от нового остатка
 * дают целые копейки (нет дробей < 0.01 коп).
 */
export function suggestRoundUp(
  principal: number,
  dailyRatePct: number,
  days: number,
  currentPayment: number,
  storedAccrued = 0,
): number | null {
  if (!dailyRatePct) return null;
  const totalAccrued = storedAccrued + accruedInterest(principal, dailyRatePct, days);
  const total = principal + totalAccrued;
  if (currentPayment >= total) return null;

  const remaining = total - currentPayment;

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
