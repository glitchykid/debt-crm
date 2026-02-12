import { calculateDebt } from '../domain/debt/calculate'
import type {
  AddPaymentPayload,
  CreateDebtorPayload,
  DebtSnapshot,
  DebtorStatus,
} from '../types/debtor'

type MockPayment = {
  id: string
  amount: number
  date: string
}

export type MockDebtor = {
  id: string
  name: string
  incurredDate: string
  principal: number
  dailyRate: number
  startDate: string
  status: DebtorStatus
  payments: MockPayment[]
}

const debtors: MockDebtor[] = [
  {
    id: 'debtor-001',
    name: 'ООО Альфа Трейд',
    incurredDate: '2025-11-30',
    principal: 14500,
    dailyRate: 0.0008,
    startDate: '2025-12-05',
    status: 'active',
    payments: [
      { id: 'pay-001', amount: 500, date: '2026-01-20' },
      { id: 'pay-002', amount: 350, date: '2026-02-01' },
    ],
  },
  {
    id: 'debtor-002',
    name: 'ИП Смирнов',
    incurredDate: '2025-11-01',
    principal: 9200,
    dailyRate: 0.0011,
    startDate: '2025-11-15',
    status: 'in_dispute',
    payments: [{ id: 'pay-003', amount: 650, date: '2026-01-28' }],
  },
]

export function getMockDebtors(): MockDebtor[] {
  return debtors
}

export function createMockDebtor(payload: CreateDebtorPayload): MockDebtor {
  const debtor: MockDebtor = {
    id: `debtor-${String(Date.now())}`,
    name: payload.name,
    incurredDate: payload.incurredDate,
    principal: payload.principal,
    dailyRate: payload.dailyRate,
    startDate: payload.startDate,
    status: payload.status ?? 'active',
    payments: [],
  }

  debtors.unshift(debtor)
  return debtor
}

export function addMockPayment(debtor: MockDebtor, payload: AddPaymentPayload): MockDebtor {
  debtor.payments.push({
    id: `pay-${String(Date.now())}`,
    amount: payload.amount,
    date: payload.date,
  })
  return debtor
}

export function removeMockPayment(debtor: MockDebtor, paymentId: string): boolean {
  const index = debtor.payments.findIndex((payment) => payment.id === paymentId)
  if (index < 0) return false
  debtor.payments.splice(index, 1)
  return true
}

export function closeMockDebtor(debtor: MockDebtor): MockDebtor {
  debtor.status = 'settled'
  return debtor
}

export function deleteMockDebtor(debtorId: string): boolean {
  const index = debtors.findIndex((debtor) => debtor.id === debtorId)
  if (index < 0) return false
  debtors.splice(index, 1)
  return true
}

export function buildSnapshot(debtor: MockDebtor, asOf: Date = new Date()): DebtSnapshot {
  return calculateDebt(
    debtor.principal,
    new Date(debtor.startDate),
    debtor.dailyRate,
    debtor.payments.map((payment) => ({ amount: payment.amount, date: new Date(payment.date) })),
    asOf,
  )
}
