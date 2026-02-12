import { describe, expect, it } from 'vitest'

import { diffInDays } from '@/domain/debt/date'

describe('diffInDays', () => {
  it('returns positive day difference', () => {
    const start = new Date('2026-01-01T12:00:00.000Z')
    const end = new Date('2026-01-04T03:00:00.000Z')
    expect(diffInDays(start, end)).toBe(3)
  })

  it('returns zero when dates are the same day', () => {
    const start = new Date(2026, 0, 1, 0, 0, 0)
    const end = new Date(2026, 0, 1, 23, 59, 59)
    expect(diffInDays(start, end)).toBe(0)
  })

  it('returns negative values when end is earlier', () => {
    const start = new Date('2026-01-10T00:00:00.000Z')
    const end = new Date('2026-01-08T00:00:00.000Z')
    expect(diffInDays(start, end)).toBe(-2)
  })
})
