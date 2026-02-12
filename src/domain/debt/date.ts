export function diffInDays(start: Date, end: Date): number {
  const startUTC: number = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endUTC: number = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  const MS_PER_DAY: number = 1000 * 60 * 60 * 24
  return Math.floor((endUTC - startUTC) / MS_PER_DAY)
}
