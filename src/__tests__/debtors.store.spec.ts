import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebtorStore } from '@/stores/debtors'
import type { DebtorDetails, DebtorSummary } from '@/types/debtor'

vi.mock('@/services/debtorApi', () => ({
  listDebtors: vi.fn(),
  getDebtorById: vi.fn(),
  createDebtor: vi.fn(),
  addDebtorPayment: vi.fn(),
  deleteDebtorPayment: vi.fn(),
}))

import {
  addDebtorPayment,
  deleteDebtorPayment,
  getDebtorById,
  listDebtors,
} from '@/services/debtorApi'

const baseSummary: DebtorSummary = {
  id: 'd1',
  name: 'Debtor A',
  incurredDate: '2026-01-01',
  principal: 1000,
  dailyRate: 0.001,
  startDate: '2026-01-02',
  status: 'active',
  interestDue: 100,
  totalDue: 1100,
}

const baseDetails: DebtorDetails = {
  ...baseSummary,
  payments: [],
  snapshot: {
    principalRemaining: 1000,
    interestAccrued: 100,
    interestPaid: 0,
    interestRemaining: 100,
    totalDebt: 1100,
  },
}

describe('useDebtorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads debtors', async () => {
    vi.mocked(listDebtors).mockResolvedValue([baseSummary])
    const store = useDebtorStore()

    await store.loadDebtors()

    expect(store.debtors).toHaveLength(1)
    expect(store.debtors[0]?.id).toBe('d1')
  })

  it('updates current debtor when loading details', async () => {
    vi.mocked(getDebtorById).mockResolvedValue(baseDetails)
    const store = useDebtorStore()

    await store.loadDebtor('d1')

    expect(store.currentDebtor?.id).toBe('d1')
    expect(store.debtors).toHaveLength(1)
  })

  it('keeps settled debtor in list after payment update', async () => {
    const settledDetails: DebtorDetails = {
      ...baseDetails,
      status: 'settled',
      interestDue: 0,
      totalDue: 0,
      snapshot: {
        ...baseDetails.snapshot,
        totalDebt: 0,
        interestRemaining: 0,
        principalRemaining: 0,
      },
    }

    vi.mocked(listDebtors).mockResolvedValue([baseSummary])
    vi.mocked(addDebtorPayment).mockResolvedValue(settledDetails)

    const store = useDebtorStore()
    await store.loadDebtors()
    await store.addPayment('d1', { amount: 1200, date: '2026-02-01' })

    expect(store.currentDebtor?.status).toBe('settled')
    expect(store.debtors).toHaveLength(1)
    expect(store.debtors[0]?.status).toBe('settled')
  })

  it('removes payment via API and updates debtor', async () => {
    const updatedDetails: DebtorDetails = {
      ...baseDetails,
      payments: [{ id: 'p2', amount: 50, date: '2026-02-01' }],
    }
    vi.mocked(deleteDebtorPayment).mockResolvedValue(updatedDetails)

    const store = useDebtorStore()
    await store.removePayment('d1', 'p1')

    expect(store.currentDebtor?.payments).toHaveLength(1)
    expect(deleteDebtorPayment).toHaveBeenCalledWith('d1', 'p1')
  })

  it('stores error message on list loading failure', async () => {
    vi.mocked(listDebtors).mockRejectedValue(new Error('boom'))
    const store = useDebtorStore()

    await store.loadDebtors()

    expect(store.error).toBe('boom')
  })
})
