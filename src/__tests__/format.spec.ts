import { describe, expect, it } from 'vitest'

import { formatPercent, formatRub } from '@/utils/format'

describe('format helpers', () => {
  it('formats ruble currency', () => {
    expect(formatRub(12345.67)).toContain('12')
    expect(formatRub(12345.67)).toContain('₽')
  })

  it('formats percent with 3 decimals', () => {
    expect(formatPercent(0.001)).toBe('0.100%')
    expect(formatPercent(0.12345)).toBe('12.345%')
  })
})
