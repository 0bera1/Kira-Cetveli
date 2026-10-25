import { type Kurus, toKurus } from './money'

export interface IncreaseResult {
  newRent: Kurus
  monthlyDiff: Kurus
  yearlyDiff: Kurus
}

export type IncreaseError = 'invalid-rent' | 'invalid-rate'

export const MAX_RENT = 1_000_000_000

/** Applies a percentage increase to a monthly rent. Rate may be zero but not negative. */
export function computeIncrease(
  rent: number | null,
  ratePercent: number | null,
): { ok: true; value: IncreaseResult } | { ok: false; error: IncreaseError } {
  if (rent === null || !Number.isFinite(rent) || rent <= 0 || rent > MAX_RENT)
    return { ok: false, error: 'invalid-rent' }
  if (
    ratePercent === null ||
    !Number.isFinite(ratePercent) ||
    ratePercent < 0 ||
    ratePercent > 1000
  )
    return { ok: false, error: 'invalid-rate' }
  const current = toKurus(rent)
  const newRent = Math.round(current * (1 + ratePercent / 100))
  const monthlyDiff = newRent - current
  return { ok: true, value: { newRent, monthlyDiff, yearlyDiff: monthlyDiff * 12 } }
}
