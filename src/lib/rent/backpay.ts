import { type Kurus, toKurus } from './money'

export interface BackpayYear {
  /** Rate the landlord was entitled to for this year (percent). */
  legalRate: number
  /** Rate actually applied (percent). */
  appliedRate: number
}

export interface BackpayRow {
  year: number
  entitledRent: Kurus
  appliedRent: Kurus
  monthlyDiff: Kurus
  yearlyDiff: Kurus
}

export interface BackpayResult {
  rows: BackpayRow[]
  total: Kurus
}

/**
 * Year 1 pays the base rent. For each later year the entitled rent grows by the legal rate and
 * the applied rent by the applied rate, each compounding independently; the 12-month differences are summed.
 * A positive total means the applied rent was lower than the entitled rent.
 */
export function backpay(baseRent: number, years: BackpayYear[]): BackpayResult | null {
  if (!Number.isFinite(baseRent) || baseRent <= 0 || years.length === 0) return null
  const bad = years.some(
    (y) =>
      !Number.isFinite(y.legalRate) ||
      !Number.isFinite(y.appliedRate) ||
      y.legalRate < 0 ||
      y.appliedRate < 0,
  )
  if (bad) return null
  let entitled = toKurus(baseRent)
  let applied = toKurus(baseRent)
  const rows: BackpayRow[] = []
  let total = 0
  years.forEach((y, i) => {
    if (i > 0) {
      entitled = Math.round(entitled * (1 + y.legalRate / 100))
      applied = Math.round(applied * (1 + y.appliedRate / 100))
    }
    const monthlyDiff = entitled - applied
    rows.push({
      year: i + 1,
      entitledRent: entitled,
      appliedRent: applied,
      monthlyDiff,
      yearlyDiff: monthlyDiff * 12,
    })
    total += monthlyDiff * 12
  })
  return { rows, total }
}
