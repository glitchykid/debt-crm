export type ThemeMode = 'auto' | 'light' | 'dark'

export function resolveThemeIsDark(mode: ThemeMode, systemPrefersDark: boolean): boolean {
  if (mode === 'auto') return systemPrefersDark
  return mode === 'dark'
}

export function readThemeMode(storage: Storage): ThemeMode {
  const value = storage.getItem('app-theme-mode')
  if (value === 'auto' || value === 'light' || value === 'dark') return value
  return 'auto'
}

export function writeThemeMode(storage: Storage, mode: ThemeMode): void {
  storage.setItem('app-theme-mode', mode)
}
