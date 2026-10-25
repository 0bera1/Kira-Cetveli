import { type Kurus, toKurus } from './money'

export type Bracket = { ust: number | null; oran: number }
export type Expense = { kind: 'goturu'; ratePercent: number } | { kind: 'gercek'; amount: number }

export interface TaxResult {
  grossIncome: Kurus
  exemption: Kurus
  expense: Kurus
  taxableBase: Kurus
  tax: Kurus
  effectivePercent: number
}

/** Progressive tax over TL brackets (upper bound null = open ended). */
export function progressiveTax(base: number, brackets: Bracket[]): number {
  let tax = 0
  let lower = 0
  for (const b of brackets) {
    if (base <= lower) break
    const upper = b.ust ?? Infinity
    tax += (Math.min(base, upper) - lower) * (b.oran / 100)
    lower = upper
  }
  return tax
}

/**
 * Estimated rental income tax: base = gross - expense - exemption (never below 0).
 * This is an estimate, not a filing.
 */
export function estimateRentTax(
  grossIncome: number,
  exemption: number,
  expense: Expense,
  brackets: Bracket[],
): TaxResult | null {
  if (!Number.isFinite(grossIncome) || grossIncome < 0) return null
  if (!Number.isFinite(exemption) || exemption < 0) return null
  const exp = expense.kind === 'goturu' ? grossIncome * (expense.ratePercent / 100) : expense.amount
  if (!Number.isFinite(exp) || exp < 0) return null
  const base = Math.max(0, grossIncome - exp - exemption)
  const tax = progressiveTax(base, brackets)
  return {
    grossIncome: toKurus(grossIncome),
    exemption: toKurus(exemption),
    expense: toKurus(exp),
    taxableBase: toKurus(base),
    tax: toKurus(tax),
    effectivePercent: grossIncome > 0 ? (tax / grossIncome) * 100 : 0,
  }
}
