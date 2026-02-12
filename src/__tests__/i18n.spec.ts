import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('useAppI18n', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('uses browser language when preference is auto', async () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'ru-RU',
      configurable: true,
    })

    const { useAppI18n } = await import('@/i18n')
    const i18n = useAppI18n()

    expect(i18n.languagePreference.value).toBe('auto')
    expect(i18n.language.value).toBe('ru')
    expect(i18n.t('menuDebtors')).toBe('Должники')
  })

  it('uses stored manual language preference', async () => {
    localStorage.setItem('app-language', 'ja')
    Object.defineProperty(window.navigator, 'language', {
      value: 'ru-RU',
      configurable: true,
    })

    const { useAppI18n } = await import('@/i18n')
    const i18n = useAppI18n()

    expect(i18n.languagePreference.value).toBe('ja')
    expect(i18n.language.value).toBe('ja')
    expect(i18n.t('menuDebtors')).toBe('債務者')
  })
})
