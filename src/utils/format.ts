const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

export function formatRub(value: number): string {
  return rubFormatter.format(value)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(3)}%`
}
