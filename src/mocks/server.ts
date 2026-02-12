import type {
  AddPaymentPayload,
  CreateDebtorPayload,
  DebtorDetails,
  DebtorSummary,
} from '../types/debtor'
import {
  addMockPayment,
  buildSnapshot,
  closeMockDebtor,
  createMockDebtor,
  deleteMockDebtor,
  getMockDebtors,
  removeMockPayment,
} from './data'

const MOCK_DELAY_MS = 250

let mockEnabled = false

export function setupMockServer(): void {
  if (mockEnabled || import.meta.env.VITE_USE_MOCKS === 'false') return

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestUrl =
      typeof input === 'string' || input instanceof URL ? input.toString() : input.url
    const method =
      init?.method ?? (typeof input === 'string' || input instanceof URL ? 'GET' : input.method)
    const url = new URL(requestUrl, window.location.origin)

    if (!url.pathname.startsWith('/api/')) {
      return originalFetch(input, init)
    }

    await delay(MOCK_DELAY_MS)

    try {
      return handleApiRequest(url.pathname, method.toUpperCase(), init?.body)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown mock server error'
      return jsonResponse({ message }, 500)
    }
  }

  mockEnabled = true
}

function handleApiRequest(path: string, method: string, body?: BodyInit | null): Response {
  if (method === 'GET' && path === '/api/debtors') {
    const data: DebtorSummary[] = getMockDebtors().map(toDebtorSummary)
    return jsonResponse(data, 200)
  }

  if (method === 'POST' && path === '/api/debtors') {
    const payload = parseJson<CreateDebtorPayload>(body)
    validateCreateDebtorPayload(payload)
    const debtor = createMockDebtor(payload)
    return jsonResponse(toDebtorDetails(debtor.id), 201)
  }

  const detailMatch = path.match(/^\/api\/debtors\/([^/]+)$/)
  if (method === 'GET' && detailMatch) {
    const debtorId = detailMatch[1]
    if (!debtorId) return jsonResponse({ message: 'Debtor not found' }, 404)
    const debtor = toDebtorDetails(debtorId)
    return jsonResponse(debtor, 200)
  }

  const paymentMatch = path.match(/^\/api\/debtors\/([^/]+)\/payments$/)
  if (method === 'POST' && paymentMatch) {
    const payload = parseJson<AddPaymentPayload>(body)
    validateAddPaymentPayload(payload)
    const debtorId = paymentMatch[1]
    if (!debtorId) return jsonResponse({ message: 'Debtor not found' }, 404)
    const debtor = getMockDebtors().find((item) => item.id === debtorId)
    if (!debtor) return jsonResponse({ message: 'Debtor not found' }, 404)
    addMockPayment(debtor, payload)
    syncDebtorStatus(debtorId)
    return jsonResponse(toDebtorDetails(debtor.id), 201)
  }

  const deletePaymentMatch = path.match(/^\/api\/debtors\/([^/]+)\/payments\/([^/]+)$/)
  if (method === 'DELETE' && deletePaymentMatch) {
    const debtorId = deletePaymentMatch[1]
    const paymentId = deletePaymentMatch[2]
    if (!debtorId || !paymentId) return jsonResponse({ message: 'Payment not found' }, 404)
    const debtor = getMockDebtors().find((item) => item.id === debtorId)
    if (!debtor) return jsonResponse({ message: 'Debtor not found' }, 404)
    const removed = removeMockPayment(debtor, paymentId)
    if (!removed) return jsonResponse({ message: 'Payment not found' }, 404)
    syncDebtorStatus(debtorId)
    return jsonResponse(toDebtorDetails(debtor.id), 200)
  }

  const closeMatch = path.match(/^\/api\/debtors\/([^/]+)\/status$/)
  if (method === 'PATCH' && closeMatch) {
    const debtorId = closeMatch[1]
    if (!debtorId) return jsonResponse({ message: 'Debtor not found' }, 404)
    const debtor = getMockDebtors().find((item) => item.id === debtorId)
    if (!debtor) return jsonResponse({ message: 'Debtor not found' }, 404)
    closeMockDebtor(debtor)
    return jsonResponse(toDebtorDetails(debtorId), 200)
  }

  const deleteDebtorMatch = path.match(/^\/api\/debtors\/([^/]+)$/)
  if (method === 'DELETE' && deleteDebtorMatch) {
    const debtorId = deleteDebtorMatch[1]
    if (!debtorId) return jsonResponse({ message: 'Debtor not found' }, 404)
    const deleted = deleteMockDebtor(debtorId)
    if (!deleted) return jsonResponse({ message: 'Debtor not found' }, 404)
    return jsonResponse({ success: true }, 200)
  }

  return jsonResponse({ message: 'Route not found in mock server' }, 404)
}

function toDebtorSummary(
  idOrDebtor: string | ReturnType<typeof getMockDebtors>[number],
): DebtorSummary {
  const debtor =
    typeof idOrDebtor === 'string'
      ? getMockDebtors().find((item) => item.id === idOrDebtor)
      : idOrDebtor
  if (!debtor) {
    throw new Error('Debtor not found')
  }

  const snapshot = buildSnapshot(debtor)
  const status = snapshot.totalDebt <= 0 ? 'settled' : debtor.status

  return {
    id: debtor.id,
    name: debtor.name,
    incurredDate: debtor.incurredDate,
    principal: debtor.principal,
    dailyRate: debtor.dailyRate,
    startDate: debtor.startDate,
    status,
    interestDue: roundMoney(snapshot.interestRemaining),
    totalDue: roundMoney(snapshot.totalDebt),
  }
}

function toDebtorDetails(id: string): DebtorDetails {
  const debtor = getMockDebtors().find((item) => item.id === id)
  if (!debtor) {
    throw new Error('Debtor not found')
  }

  const summary = toDebtorSummary(debtor)
  const snapshot = buildSnapshot(debtor)

  return {
    ...summary,
    payments: [...debtor.payments].sort((a, b) => b.date.localeCompare(a.date)),
    snapshot: {
      principalRemaining: roundMoney(snapshot.principalRemaining),
      interestAccrued: roundMoney(snapshot.interestAccrued),
      interestPaid: roundMoney(snapshot.interestPaid),
      interestRemaining: roundMoney(snapshot.interestRemaining),
      totalDebt: roundMoney(snapshot.totalDebt),
    },
  }
}

function validateCreateDebtorPayload(payload: CreateDebtorPayload): void {
  if (!payload.name?.trim()) throw new Error('Debtor name is required')
  if (!payload.incurredDate) throw new Error('Debt incurred date is required')
  if (!(payload.principal > 0)) throw new Error('Principal must be greater than 0')
  if (!(payload.dailyRate > 0)) throw new Error('Daily rate must be greater than 0')
  if (!payload.startDate) throw new Error('Start date is required')
}

function validateAddPaymentPayload(payload: AddPaymentPayload): void {
  if (!(payload.amount > 0)) throw new Error('Payment amount must be greater than 0')
  if (!payload.date) throw new Error('Payment date is required')
}

function parseJson<T>(body: BodyInit | null | undefined): T {
  if (!body || typeof body !== 'string') {
    throw new Error('Invalid request body')
  }
  return JSON.parse(body) as T
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function syncDebtorStatus(debtorId: string): void {
  const debtor = getMockDebtors().find((item) => item.id === debtorId)
  if (!debtor) return
  const snapshot = buildSnapshot(debtor)
  if (snapshot.totalDebt <= 0) {
    debtor.status = 'settled'
  } else if (debtor.status === 'settled') {
    debtor.status = 'active'
  }
}
