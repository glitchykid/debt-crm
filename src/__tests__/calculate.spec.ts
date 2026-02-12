import { calculateDebt } from '@/domain/debt/calculate'
import type { Payment } from '@/domain/debt/types'
import { describe, expect, it } from 'vitest'

describe('calculateDebt', () => {
  const dailyRate = 0.008

  it('calculates debt without payments', () => {
    const principal: number = 10000
    const startDate = new Date('2024-05-01')
    const asOf = new Date('2024-05-11') // 10 дней

    const result = calculateDebt(principal, startDate, dailyRate, [], asOf)

    expect(result.interestAccrued).toBe(800)
    expect(result.interestRemaining).toBe(800)
    expect(result.principalRemaining).toBe(10000)
    expect(result.totalDebt).toBe(10800)
  })

  it('payment covers only part of interest', () => {
    const principal = 10000
    const startDate = new Date('2024-05-01')
    const asOf = new Date('2024-05-11')

    const payments: Payment[] = [{ amount: 500, date: new Date('2024-05-11') }]

    const result = calculateDebt(principal, startDate, dailyRate, payments, asOf)

    expect(result.interestAccrued).toBe(800)
    expect(result.interestPaid).toBe(500)
    expect(result.interestRemaining).toBe(300)
    expect(result.principalRemaining).toBe(10000)
    expect(result.totalDebt).toBe(10300)
  })

  it('payment covers interest and part of principal', () => {
    const principal = 10000
    const startDate = new Date('2024-05-01')
    const asOf = new Date('2024-05-11')

    const payments: Payment[] = [{ amount: 1000, date: new Date('2024-05-11') }]

    const result = calculateDebt(principal, startDate, dailyRate, payments, asOf)

    expect(result.interestAccrued).toBe(800)
    expect(result.interestPaid).toBe(800)
    expect(result.interestRemaining).toBe(0)
    expect(result.principalRemaining).toBe(9800)
    expect(result.totalDebt).toBe(9800)
  })

  it('handles multiple payments correctly', () => {
    const principal = 10000
    const startDate = new Date('2024-05-01')
    const asOf = new Date('2024-05-21') // 20 дней

    const payments: Payment[] = [
      { amount: 500, date: new Date('2024-05-11') }, // 10 дней
      { amount: 1000, date: new Date('2024-05-16') }, // ещё 5 дней
    ]

    const result = calculateDebt(principal, startDate, dailyRate, payments, asOf)

    expect(result.totalDebt).toBeGreaterThan(0)
    expect(result.principalRemaining).toBeGreaterThanOrEqual(0)
  })

  it('ignores payments after asOf date', () => {
    const principal = 10000
    const startDate = new Date('2024-05-01')
    const asOf = new Date('2024-05-11')

    const payments: Payment[] = [{ amount: 1000, date: new Date('2024-05-20') }]

    const result = calculateDebt(principal, startDate, dailyRate, payments, asOf)

    expect(result.interestAccrued).toBe(800)
    expect(result.principalRemaining).toBe(10000)
  })
})
