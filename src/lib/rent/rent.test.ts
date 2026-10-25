import { describe, expect, it } from 'vitest'
import { tufeSchema, yasalSchema } from '../data/schemas'
import { backpay } from './backpay'
import { addMonths, averageChangeFromIndex, crossCheck, latestDataMonth, rateOptions } from './cpi'
import { computeIncrease } from './increase'
import { daysBetween, depositRefund, simpleInterest } from './interest'
import { legalInterestOn } from './legalRate'
import { formatLira, parseNumber, toKurus } from './money'
import { estimateRentTax, progressiveTax } from './tax'
import tufeJson from '../../../public/data/tufe.json'
import yasalJson from '../../../public/data/yasal-oranlar.json'

/** Index growing by a constant monthly factor starting at `start` (YYYY-MM). */
function geometric(start: string, months: number, factor: number, base = 100) {
  const out: Record<string, number> = {}
  for (let i = 0; i < months; i++) out[addMonths(start, i)] = base * factor ** i
  return out
}

describe('money', () => {
  it('rounds to kurus', () => {
    expect(toKurus(10.005)).toBe(1001)
    expect(toKurus(0.1 + 0.2)).toBe(30)
  })
  it('formats Turkish style', () => {
    expect(formatLira(123456)).toBe('₺1.234,56')
    expect(formatLira(0)).toBe('₺0,00')
  })
  it('parses Turkish input', () => {
    expect(parseNumber('1.234,56')).toBe(1234.56)
    expect(parseNumber('1234,5')).toBe(1234.5)
    expect(parseNumber('10.000')).toBe(10000)
    expect(parseNumber('12.5')).toBe(12.5)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('1,2,3')).toBeNull()
  })
})

describe('cpi 12-month average', () => {
  it('equals r^12 - 1 for constant monthly growth', () => {
    const r = 1.02
    const idx = geometric('2023-01', 36, r)
    const expected = Math.round((r ** 12 - 1) * 10000) / 100
    expect(averageChangeFromIndex(idx, '2024-12')).toBe(expected)
  })
  it('matches a hand-computed example', () => {
    // previous 12 months all 100, last 12 months all 130 -> +30%
    const idx: Record<string, number> = {}
    for (let i = 0; i < 12; i++) idx[addMonths('2023-01', i)] = 100
    for (let i = 12; i < 24; i++) idx[addMonths('2023-01', i)] = 130
    expect(averageChangeFromIndex(idx, '2024-12')).toBe(30)
  })
  it('returns null when a month is missing', () => {
    const idx = geometric('2023-01', 24, 1.01)
    delete idx['2023-06']
    expect(averageChangeFromIndex(idx, '2024-12')).toBeNull()
    expect(averageChangeFromIndex({}, '2024-12')).toBeNull()
  })
  it('handles year boundaries in addMonths', () => {
    expect(addMonths('2024-01', -1)).toBe('2023-12')
    expect(addMonths('2024-12', 1)).toBe('2025-01')
    expect(addMonths('2024-12', -23)).toBe('2023-01')
  })
  it('cross-check flags differences above 0.02', () => {
    const endeks = geometric('2023-01', 24, 1.02)
    const computed = averageChangeFromIndex(endeks, '2024-12')!
    expect(crossCheck({ endeks, ortalamaDegisim: { '2024-12': computed + 0.02 } })).toEqual([])
    expect(crossCheck({ endeks, ortalamaDegisim: { '2024-12': computed + 0.05 } })).toHaveLength(1)
  })
  it('prefers announced values and falls back to computed', () => {
    const endeks = geometric('2023-01', 24, 1.02)
    const opts = rateOptions({ endeks, ortalamaDegisim: { '2024-11': 20 } }, 3)
    expect(latestDataMonth({ endeks, ortalamaDegisim: { '2024-11': 20 } })).toBe('2024-12')
    expect(opts.map((o) => [o.dataMonth, o.source])).toEqual([
      ['2024-12', 'computed'],
      ['2024-11', 'announced'],
    ])
    expect(opts[0].renewalMonth).toBe('2025-01')
  })
  it('returns no options for empty data', () => {
    expect(rateOptions({ endeks: {}, ortalamaDegisim: {} })).toEqual([])
  })
})

describe('rent increase', () => {
  it('applies the rate and rounds to kurus', () => {
    const r = computeIncrease(10000, 31.49)
    expect(r.ok && r.value.newRent).toBe(1314900)
    expect(r.ok && r.value.monthlyDiff).toBe(314900)
    expect(r.ok && r.value.yearlyDiff).toBe(314900 * 12)
  })
  it('rounds half kurus', () => {
    const r = computeIncrease(333.33, 10)
    expect(r.ok && r.value.newRent).toBe(36666)
  })
  it('accepts a zero rate', () => {
    const r = computeIncrease(5000, 0)
    expect(r.ok && r.value.monthlyDiff).toBe(0)
  })
  it('rejects zero, negative, empty and huge input', () => {
    expect(computeIncrease(0, 10)).toEqual({ ok: false, error: 'invalid-rent' })
    expect(computeIncrease(-5, 10)).toEqual({ ok: false, error: 'invalid-rent' })
    expect(computeIncrease(null, 10)).toEqual({ ok: false, error: 'invalid-rent' })
    expect(computeIncrease(1e12, 10)).toEqual({ ok: false, error: 'invalid-rent' })
    expect(computeIncrease(100, -1)).toEqual({ ok: false, error: 'invalid-rate' })
    expect(computeIncrease(100, null)).toEqual({ ok: false, error: 'invalid-rate' })
    expect(computeIncrease(100, 5000)).toEqual({ ok: false, error: 'invalid-rate' })
  })
  it('handles very large valid rents', () => {
    const r = computeIncrease(999_999_999, 50)
    expect(r.ok && r.value.newRent).toBe(Math.round(99_999_999_900 * 1.5))
  })
})

describe('interest', () => {
  it('uses days/365', () => {
    expect(simpleInterest(10000, 24, 365)).toBe(240000)
    expect(simpleInterest(10000, 24, 30)).toBe(Math.round(1000000 * 0.24 * (30 / 365)))
  })
  it('is zero for zero days or zero rate', () => {
    expect(simpleInterest(10000, 24, 0)).toBe(0)
    expect(simpleInterest(10000, 0, 100)).toBe(0)
  })
  it('rejects invalid input', () => {
    expect(simpleInterest(0, 24, 10)).toBeNull()
    expect(simpleInterest(-1, 24, 10)).toBeNull()
    expect(simpleInterest(100, -1, 10)).toBeNull()
    expect(simpleInterest(100, 24, -1)).toBeNull()
    expect(simpleInterest(NaN, 24, 1)).toBeNull()
  })
  it('counts days across month end and leap years', () => {
    expect(daysBetween(new Date(2024, 1, 28), new Date(2024, 2, 1))).toBe(2)
    expect(daysBetween(new Date(2023, 1, 28), new Date(2023, 2, 1))).toBe(1)
    expect(daysBetween(new Date(2024, 0, 1), new Date(2025, 0, 1))).toBe(366)
  })
  it('computes deposit refund and rejects reversed dates', () => {
    const r = depositRefund(20000, new Date(2024, 0, 1), new Date(2025, 0, 1), 10)!
    expect(r.days).toBe(366)
    expect(r.total).toBe(r.principal + r.interest)
    expect(depositRefund(20000, new Date(2025, 0, 1), new Date(2024, 0, 1), 10)).toBeNull()
  })
})

describe('backpay', () => {
  it('is zero when applied equals legal', () => {
    const r = backpay(10000, [
      { legalRate: 0, appliedRate: 0 },
      { legalRate: 30, appliedRate: 30 },
      { legalRate: 25, appliedRate: 25 },
    ])!
    expect(r.total).toBe(0)
  })
  it('sums multi-year differences with compounding', () => {
    const r = backpay(10000, [
      { legalRate: 0, appliedRate: 0 },
      { legalRate: 40, appliedRate: 10 },
      { legalRate: 30, appliedRate: 10 },
    ])!
    // entitled: 10000 -> 14000 -> 18200 ; applied: 10000 -> 11000 -> 12100
    expect(r.rows.map((x) => x.entitledRent)).toEqual([1000000, 1400000, 1820000])
    expect(r.rows.map((x) => x.appliedRent)).toEqual([1000000, 1100000, 1210000])
    expect(r.total).toBe((300000 + 610000) * 12)
  })
  it('rejects bad input', () => {
    expect(backpay(0, [{ legalRate: 1, appliedRate: 1 }])).toBeNull()
    expect(backpay(100, [])).toBeNull()
    expect(backpay(100, [{ legalRate: -1, appliedRate: 1 }])).toBeNull()
  })
})

describe('tax', () => {
  const brackets = [
    { ust: 100000, oran: 15 },
    { ust: 200000, oran: 20 },
    { ust: null, oran: 30 },
  ]
  it('applies brackets progressively at the boundaries', () => {
    expect(progressiveTax(0, brackets)).toBe(0)
    expect(progressiveTax(100000, brackets)).toBe(15000)
    expect(progressiveTax(100001, brackets)).toBeCloseTo(15000.2, 5)
    expect(progressiveTax(200000, brackets)).toBe(35000)
    expect(progressiveTax(300000, brackets)).toBe(65000)
  })
  it('never goes below zero when exemption exceeds income', () => {
    const r = estimateRentTax(30000, 47000, { kind: 'goturu', ratePercent: 15 }, brackets)!
    expect(r.taxableBase).toBe(0)
    expect(r.tax).toBe(0)
  })
  it('supports flat-rate and actual expense', () => {
    const a = estimateRentTax(200000, 50000, { kind: 'goturu', ratePercent: 15 }, brackets)!
    expect(a.expense).toBe(3000000)
    expect(a.taxableBase).toBe(12000000)
    const b = estimateRentTax(200000, 50000, { kind: 'gercek', amount: 100000 }, brackets)!
    expect(b.taxableBase).toBe(5000000)
    expect(b.tax).toBe(750000)
  })
  it('rejects negative input', () => {
    expect(estimateRentTax(-1, 0, { kind: 'gercek', amount: 0 }, brackets)).toBeNull()
    expect(estimateRentTax(1, -1, { kind: 'gercek', amount: 0 }, brackets)).toBeNull()
    expect(estimateRentTax(1, 0, { kind: 'gercek', amount: -1 }, brackets)).toBeNull()
  })
})

describe('legal interest timeline', () => {
  const data = {
    yasalFaiz: [
      {
        baslangic: '2020-01-01',
        bitis: '2023-12-31',
        oran: 9,
        kaynak: '',
        dogrulamaTarihi: null,
        dogrulanmali: true,
      },
      {
        baslangic: '2024-01-01',
        bitis: null,
        oran: 24,
        kaynak: '',
        dogrulamaTarihi: null,
        dogrulanmali: true,
      },
    ],
  }
  it('picks the right period', () => {
    expect(legalInterestOn(data, '2023-12-31')).toBe(9)
    expect(legalInterestOn(data, '2024-01-01')).toBe(24)
    expect(legalInterestOn(data, '2019-12-31')).toBeNull()
  })
})

describe('shipped data files', () => {
  it('validate against the schemas', () => {
    expect(() => tufeSchema.parse(tufeJson)).not.toThrow()
    expect(() => yasalSchema.parse(yasalJson)).not.toThrow()
  })
  it('reject malformed data', () => {
    const bad = { ...tufeJson, ortalamaDegisim: { '2026-13': 10 } }
    expect(() => tufeSchema.parse(bad)).toThrow()
    expect(() => tufeSchema.parse({ ...tufeJson, ortalamaDegisim: { '2026-01': -999 } })).toThrow()
    expect(() => tufeSchema.parse({ ...tufeJson, endeks: { '2026-01': -1 } })).toThrow()
  })
  it('announced rates agree with the index series where both exist', () => {
    expect(crossCheck(tufeSchema.parse(tufeJson))).toEqual([])
  })
})

describe('real EVDS index', () => {
  const tufe = tufeSchema.parse(tufeJson)
  it('reproduces every announced rate from the index within 0.02', () => {
    for (const [month, announced] of Object.entries(tufe.ortalamaDegisim)) {
      const computed = averageChangeFromIndex(tufe.endeks, month)
      expect(computed, month).not.toBeNull()
      expect(Math.abs(computed! - announced), month).toBeLessThanOrEqual(0.02)
    }
  })
  it('records which EVDS series the values came from', () => {
    expect(tufe.seri).toBe('TP.TUKFIY2025.GENEL')
  })
})

describe('shipped statutory interest', () => {
  const yasal = yasalSchema.parse(yasalJson)
  it('is 24 percent before and 31 percent from the 7589 law', () => {
    expect(legalInterestOn(yasal, '2026-07-30')).toBe(24)
    expect(legalInterestOn(yasal, '2026-07-31')).toBe(31)
    expect(legalInterestOn(yasal, '2026-10-25')).toBe(31)
  })
})
