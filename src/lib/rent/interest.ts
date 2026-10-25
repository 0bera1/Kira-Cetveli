import { differenceInCalendarDays } from 'date-fns'
import { type Kurus, toKurus } from './money'

export const DAY_BASIS = 365

/** Simple interest: amount * annualRate% * days / 365. */
export function simpleInterest(
  amount: number,
  annualRatePercent: number,
  days: number,
): Kurus | null {
  if (![amount, annualRatePercent, days].every(Number.isFinite)) return null
  if (amount <= 0 || annualRatePercent < 0 || days < 0 || annualRatePercent > 1000) return null
  return Math.round(toKurus(amount) * (annualRatePercent / 100) * (days / DAY_BASIS))
}

export function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(to, from)
}

export interface DepositResult {
  principal: Kurus
  interest: Kurus
  total: Kurus
  days: number
}

export function depositRefund(
  deposit: number,
  paidOn: Date,
  refundOn: Date,
  annualRatePercent: number,
): DepositResult | null {
  const days = daysBetween(paidOn, refundOn)
  if (days < 0) return null
  const interest = simpleInterest(deposit, annualRatePercent, days)
  if (interest === null) return null
  const principal = toKurus(deposit)
  return { principal, interest, total: principal + interest, days }
}
