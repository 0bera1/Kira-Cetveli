import type { TufeData } from '../data/schemas'

export type MonthKey = string // YYYY-MM

type Series = Pick<TufeData, 'endeks' | 'ortalamaDegisim'>

export function addMonths(key: MonthKey, delta: number): MonthKey {
  const [y, m] = key.split('-').map(Number)
  const idx = y * 12 + (m - 1) + delta
  const ny = Math.floor(idx / 12)
  return `${ny}-${String((idx % 12) + 1).padStart(2, '0')}`
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * 12-month-average CPI change for a data month, per TBK m.344:
 * (mean of last 12 index values / mean of the previous 12) - 1, in percent, 2 decimals.
 * Returns null if any of the 24 required months is missing.
 */
export function averageChangeFromIndex(
  endeks: Record<MonthKey, number>,
  month: MonthKey,
): number | null {
  const mean = (start: number) => {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const v = endeks[addMonths(month, start + i)]
      if (v === undefined) return null
      sum += v
    }
    return sum / 12
  }
  const current = mean(-11)
  const previous = mean(-23)
  if (current === null || previous === null) return null
  return round2((current / previous - 1) * 100)
}

export const CROSS_CHECK_TOLERANCE = 0.02

export interface Mismatch {
  month: MonthKey
  computed: number
  announced: number
}

/** Months where the computed value differs from the announced one by more than the tolerance. */
export function crossCheck(tufe: Series): Mismatch[] {
  const out: Mismatch[] = []
  for (const [month, announced] of Object.entries(tufe.ortalamaDegisim)) {
    const computed = averageChangeFromIndex(tufe.endeks, month)
    if (computed !== null && Math.abs(computed - announced) > CROSS_CHECK_TOLERANCE + 1e-9)
      out.push({ month, computed, announced })
  }
  return out
}

export interface RateOption {
  /** Month the rent is renewed (the month after the data month). */
  renewalMonth: MonthKey
  dataMonth: MonthKey
  rate: number
  source: 'announced' | 'computed'
}

export function rateForDataMonth(
  tufe: Series,
  dataMonth: MonthKey,
): { rate: number; source: 'announced' | 'computed' } | null {
  const announced = tufe.ortalamaDegisim[dataMonth]
  if (announced !== undefined) return { rate: announced, source: 'announced' }
  const computed = averageChangeFromIndex(tufe.endeks, dataMonth)
  return computed === null ? null : { rate: computed, source: 'computed' }
}

export function latestDataMonth(tufe: Series): MonthKey | null {
  const months = [
    ...new Set([...Object.keys(tufe.ortalamaDegisim), ...Object.keys(tufe.endeks)]),
  ].sort()
  for (let i = months.length - 1; i >= 0; i--) {
    if (rateForDataMonth(tufe, months[i])) return months[i]
  }
  return null
}

/** One option per renewal month, newest first (up to `count`). */
export function rateOptions(tufe: Series, count = 12): RateOption[] {
  const latest = latestDataMonth(tufe)
  if (!latest) return []
  const out: RateOption[] = []
  for (let i = 0; i < count; i++) {
    const dataMonth = addMonths(latest, -i)
    const r = rateForDataMonth(tufe, dataMonth)
    if (r) out.push({ renewalMonth: addMonths(dataMonth, 1), dataMonth, ...r })
  }
  return out
}
