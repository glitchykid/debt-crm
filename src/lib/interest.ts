/**
 * Логика начисления простых процентов.
 * Ставка — % в ДЕНЬ (поле interest в БД).
 * Формула: principal × rate / 100 — с копейками, точный расчёт.
 */

/** Процентов за 1 день, ₽ с копейками */
export function dailyInterestAmount(principal: number, dailyRatePct: number): number {
  if (!dailyRatePct || !principal) return 0;
  return principal * (dailyRatePct / 100);
}

/** Накопленные проценты за N дней, ₽ с копейками */
export function accruedInterest(principal: number, dailyRatePct: number, days: number): number {
  return dailyInterestAmount(principal, dailyRatePct) * Math.max(0, days);
}

/** Итого = долг + перенесённые % + накопленные за N дней */
export function totalDebt(
  principal: number,
  dailyRatePct: number,
  days: number,
  storedAccrued = 0,
): number {
  return principal + storedAccrued + accruedInterest(principal, dailyRatePct, days);
}

/**
 * Расчёт после платежа.
 * Проценты гасятся первыми, затем основной долг.
 */
export function afterPayment(
  principal: number,
  dailyRatePct: number,
  days: number,
  payment: number,
  storedAccrued = 0,
): {
  newPrincipal: number;
  remainder: number;
  totalAccrued: number;
  paidAccrued: number;
  paidPrincipal: number;
} {
  const totalAccrued = storedAccrued + accruedInterest(principal, dailyRatePct, days);
  const total = principal + totalAccrued;
  const paid = Math.min(payment, total);
  const paidAccrued = Math.min(paid, totalAccrued);
  const paidPrincipal = paid - paidAccrued;
  const newPrincipal = Math.max(0, principal - paidPrincipal);
  const remainder = Math.max(0, payment - total);
  return { newPrincipal, remainder, totalAccrued, paidAccrued, paidPrincipal };
}

/**
 * Минимальная доплата δ (в копейках, шаг 0.01 ₽) такая, что
 * (newPrincipal - δ) × rate/100 — целое число рублей без копеек.
 *
 * Т.е. ищем наименьший остаток долга ≤ newPrincipal, при котором
 * daily interest кратен 1 ₽ (нет дробной части копеек).
 *
 * Возвращает { delta, roundedPrincipal } или null если уже ровно.
 */
export function calcRoundUpPayment(
  principal: number,
  dailyRatePct: number,
  days: number,
  payment: number,
  storedAccrued = 0,
): { delta: number; roundedPrincipal: number; roundedDaily: number } | null {
  if (!dailyRatePct) return null;

  const { newPrincipal } = afterPayment(principal, dailyRatePct, days, payment, storedAccrued);
  if (newPrincipal <= 0) return null;

  const currentDaily = dailyInterestAmount(newPrincipal, dailyRatePct);
  // Уже целый рубль?
  if (Math.abs(currentDaily - Math.round(currentDaily)) < 0.0001) return null;

  // Перебираем шагом 1 копейка: ищем минимальный delta >= 0.01
  // при котором (newPrincipal - delta) * rate/100 — целое
  for (let kopecks = 1; kopecks <= 1_000_000; kopecks++) {
    const delta = kopecks / 100;
    const reduced = newPrincipal - delta;
    if (reduced < 0) break;
    const daily = reduced * (dailyRatePct / 100);
    if (Math.abs(daily - Math.round(daily)) < 0.0001) {
      return {
        delta,
        roundedPrincipal: reduced,
        roundedDaily: Math.round(daily),
      };
    }
  }
  return null;
}

/** Русское название дня недели */
const DAYS_RU = ["воскресенье", "понедельник", "вторник", "среду", "четверг", "пятницу", "субботу"];

export function nextPaymentDayLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const dayName = DAYS_RU[d.getDay()];
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  if (diff === -1) return "вчера";
  if (diff > 0) return `через ${diff} дн. (${dayName})`;
  return `${Math.abs(diff)} дн. назад (${dayName})`;
}

/** Форматирование с копейками */
export function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Форматирование без копеек (целые рубли) */
export function fmtRub(n: number): string {
  return Math.round(n).toLocaleString("ru-RU") + " ₽";
}
