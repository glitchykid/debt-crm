import { describe, expect, it } from 'vitest'

import { readThemeMode, resolveThemeIsDark, writeThemeMode } from '@/theme/preference'

describe('theme preference helpers', () => {
  it('resolves auto theme from system preference', () => {
    expect(resolveThemeIsDark('auto', true)).toBe(true)
    expect(resolveThemeIsDark('auto', false)).toBe(false)
  })

  it('resolves explicit light/dark modes', () => {
    expect(resolveThemeIsDark('dark', false)).toBe(true)
    expect(resolveThemeIsDark('light', true)).toBe(false)
  })

  it('reads and writes theme mode in storage', () => {
    const storage = window.localStorage
    storage.removeItem('app-theme-mode')
    expect(readThemeMode(storage)).toBe('auto')

    writeThemeMode(storage, 'dark')
    expect(readThemeMode(storage)).toBe('dark')
  })
})
