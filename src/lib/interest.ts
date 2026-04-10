/**
 * Логика начисления простых процентов.
 * Ставка — % в ДЕНЬ (поле interest в БД).
 *
 * Правило округления:
 *   Проценты за день = Math.floor(principal × rate / 100)
 *   Только целые рубли — копеек нет.
 *   Аккумуляция: за N дней = dailyRub × N
 */

/** Процентов за 1 день — целые рубли (без копеек) */
export function dailyInterestRub(principal: number, dailyRatePct: number): number {
  if (!dailyRatePct || !principal) return 0;
  return Math.floor(principal * (dailyRatePct / 100));
}

/** Накопленные проценты за N дней — целые рубли */
export function accruedInterest(principal: number, dailyRatePct: number, days: number): number {
  return dailyInterestRub(principal, dailyRatePct) * Math.max(0, days);
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
 * Всё в целых рублях.
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

  // Платёж не может превышать долг
  const paid = Math.min(payment, total);

  // Сначала гасим проценты
  const paidAccrued = Math.min(paid, totalAccrued);
  const paidPrincipal = paid - paidAccrued;
  const newPrincipal = Math.max(0, principal - paidPrincipal);
  const remainder = Math.max(0, payment - total);

  return { newPrincipal, remainder, totalAccrued, paidAccrued, paidPrincipal };
}

/**
 * Минимальная доплата δ (в рублях, шаг 1 руб) такая, что
 * Math.floor(newPrincipal × rate/100) не изменится после δ доплаты.
 * Т.к. мы уже работаем в целых рублях, дробей копеек нет — функция
 * проверяет, можно ли уменьшить остаток до суммы кратной 100/rate.
 *
 * Возвращает null если доплата не нужна.
 */
export function suggestRoundUp(
  principal: number,
  dailyRatePct: number,
  days: number,
  currentPayment: number,
  storedAccrued = 0,
): number | null {
  if (!dailyRatePct) return null;

  const { newPrincipal } = afterPayment(principal, dailyRatePct, days, currentPayment, storedAccrued);
  if (newPrincipal <= 0) return null;

  const currentDaily = dailyInterestRub(newPrincipal, dailyRatePct);
  // Ищем минимальный δ >= 1 руб такой, что daily уменьшится
  // (т.е. новый остаток даст меньше рублей в день)
  for (let delta = 1; delta <= 1000; delta++) {
    const reduced = newPrincipal - delta;
    if (reduced < 0) break;
    if (dailyInterestRub(reduced, dailyRatePct) < currentDaily) {
      return delta;
    }
  }
  return null;
}

/** Форматирование суммы в рублях без копеек */
export function fmtRub(n: number): string {
  return Math.floor(n).toLocaleString("ru-RU") + " ₽";
}

/** Форматирование суммы с копейками (для отображения основного долга) */
export function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
