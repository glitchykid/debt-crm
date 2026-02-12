import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('mock data helpers', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates debtor and updates list', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
    const { createMockDebtor, getMockDebtors } = await import('@/mocks/data')

    const created = createMockDebtor({
      name: 'New Debtor',
      incurredDate: '2026-01-10',
      principal: 1000,
      dailyRate: 0.001,
      startDate: '2026-01-11',
      status: 'active',
    })

    expect(created.id).toBe('debtor-1700000000000')
    expect(getMockDebtors()[0]?.name).toBe('New Debtor')
  })

  it('adds and removes payment', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000001)
    const { addMockPayment, getMockDebtors, removeMockPayment } = await import('@/mocks/data')

    const debtor = getMockDebtors()[0]
    if (!debtor) throw new Error('Missing debtor in seed')

    addMockPayment(debtor, { amount: 123, date: '2026-02-01' })
    expect(debtor.payments.some((p) => p.id === 'pay-1700000000001')).toBe(true)

    const removed = removeMockPayment(debtor, 'pay-1700000000001')
    expect(removed).toBe(true)
    expect(debtor.payments.some((p) => p.id === 'pay-1700000000001')).toBe(false)
  })

  it('closes and deletes debtor', async () => {
    const { closeMockDebtor, deleteMockDebtor, getMockDebtors } = await import('@/mocks/data')
    const debtor = getMockDebtors()[0]
    if (!debtor) throw new Error('Missing debtor in seed')

    closeMockDebtor(debtor)
    expect(debtor.status).toBe('settled')

    const deleted = deleteMockDebtor(debtor.id)
    expect(deleted).toBe(true)
    expect(getMockDebtors().find((d) => d.id === debtor.id)).toBeUndefined()
  })

  it('builds debt snapshot', async () => {
    const { buildSnapshot, getMockDebtors } = await import('@/mocks/data')
    const debtor = getMockDebtors()[0]
    if (!debtor) throw new Error('Missing debtor in seed')

    const snapshot = buildSnapshot(debtor, new Date('2026-02-15'))
    expect(snapshot.totalDebt).toBeGreaterThan(0)
    expect(snapshot.principalRemaining).toBeGreaterThanOrEqual(0)
  })
})
