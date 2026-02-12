import type {
  AddPaymentPayload,
  CreateDebtorPayload,
  DebtorDetails,
  DebtorSummary,
} from '../types/debtor'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export function listDebtors(): Promise<DebtorSummary[]> {
  return apiGet<DebtorSummary[]>('/debtors')
}

export function getDebtorById(id: string): Promise<DebtorDetails> {
  return apiGet<DebtorDetails>(`/debtors/${id}`)
}

export function createDebtor(payload: CreateDebtorPayload): Promise<DebtorDetails> {
  return apiPost<DebtorDetails, CreateDebtorPayload>('/debtors', payload)
}

export function addDebtorPayment(
  debtorId: string,
  payload: AddPaymentPayload,
): Promise<DebtorDetails> {
  return apiPost<DebtorDetails, AddPaymentPayload>(`/debtors/${debtorId}/payments`, payload)
}

export function deleteDebtorPayment(debtorId: string, paymentId: string): Promise<DebtorDetails> {
  return apiDelete<DebtorDetails>(`/debtors/${debtorId}/payments/${paymentId}`)
}

export function closeDebtor(debtorId: string): Promise<DebtorDetails> {
  return apiPatch<DebtorDetails, { status: 'settled' }>(`/debtors/${debtorId}/status`, {
    status: 'settled',
  })
}

export function deleteDebtor(debtorId: string): Promise<{ success: true }> {
  return apiDelete<{ success: true }>(`/debtors/${debtorId}`)
}
