export type DebtorStatus = 'active' | 'in_dispute' | 'settled'

export type DebtorSummary = {
  id: string
  name: string
  incurredDate: string
  principal: number
  dailyRate: number
  startDate: string
  status: DebtorStatus
  interestDue: number
  totalDue: number
}

export type DebtorPayment = {
  id: string
  amount: number
  date: string
}

export type DebtSnapshot = {
  principalRemaining: number
  interestAccrued: number
  interestPaid: number
  interestRemaining: number
  totalDebt: number
}

export type DebtorDetails = DebtorSummary & {
  payments: DebtorPayment[]
  snapshot: DebtSnapshot
}

export type CreateDebtorPayload = {
  name: string
  incurredDate: string
  principal: number
  dailyRate: number
  startDate: string
  status?: DebtorStatus
}

export type AddPaymentPayload = {
  amount: number
  date: string
}
