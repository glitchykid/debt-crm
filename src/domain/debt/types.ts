export type CalculatedDebt = {
  principalRemaining: number
  interestAccrued: number
  interestPaid: number
  interestRemaining: number
  totalDebt: number
}

export type Payment = {
  amount: number
  date: Date
}
