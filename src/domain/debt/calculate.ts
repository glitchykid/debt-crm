import { diffInDays } from './date'
import type { CalculatedDebt, Payment } from './types'

export function calculateDebt(
  principal: number,
  startDate: Date,
  dailyRate: number,
  payments: readonly Payment[],
  asOf: Date,
): CalculatedDebt {
  let principalRemaining: number = principal
  let interestAccrued: number = 0
  let interestPaid: number = 0
  let currentDate: Date = startDate

  const sortedPayments: Payment[] = [...payments].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )

  for (const payment of sortedPayments) {
    if (payment.date.getTime() > asOf.getTime()) break

    const days: number = Math.max(diffInDays(currentDate, payment.date), 0)

    if (days > 0 && principalRemaining > 0) {
      interestAccrued += principalRemaining * dailyRate * days
    }

    const interestRemainingBeforePayment: number = Math.max(interestAccrued - interestPaid, 0)

    const toInterest: number = Math.min(payment.amount, interestRemainingBeforePayment)

    interestPaid += toInterest

    const remainder: number = payment.amount - toInterest

    if (remainder > 0) {
      principalRemaining = Math.max(principalRemaining - remainder, 0)
    }

    currentDate = payment.date
  }

  const finalDays: number = Math.max(diffInDays(currentDate, asOf), 0)

  if (finalDays > 0 && principalRemaining > 0) {
    interestAccrued += principalRemaining * dailyRate * finalDays
  }

  const interestRemaining: number = Math.max(interestAccrued - interestPaid, 0)

  const totalDebt: number = principalRemaining + interestRemaining

  return {
    principalRemaining,
    interestAccrued,
    interestPaid,
    interestRemaining,
    totalDebt,
  }
}
