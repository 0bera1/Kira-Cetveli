import { describe, expect, it } from 'vitest'
import { rateOn, statutoryPeriods } from './statutoryInterest'

describe('rateOn', () => {
  const s = { '2025-12-30': 38.75, '2026-02-01': 40 }
  it('carries the latest earlier value forward', () => {
    expect(rateOn(s, '2025-12-31')).toBe(38.75)
    expect(rateOn(s, '2026-02-01')).toBe(40)
    expect(rateOn(s, '2026-03-01')).toBe(40)
  })
  it('is null before the first value', () => {
    expect(rateOn(s, '2025-01-01')).toBeNull()
  })
})

describe('statutoryPeriods', () => {
  it('gives 31% for 2026 from the day the law took effect (rate 38.75)', () => {
    const p = statutoryPeriods({ '2025-12-31': 38.75, '2026-06-30': 38.75 }, '2026-10-25')
    expect(p).toHaveLength(1)
    expect(p[0]).toMatchObject({ baslangic: '2026-07-31', bitis: null, oran: 31 })
  })
  it('starts a new year on 1 January and closes the previous period', () => {
    const p = statutoryPeriods({ '2025-12-31': 38.75, '2026-12-31': 30 }, '2027-02-10')
    expect(p.map((x) => [x.baslangic, x.bitis, x.oran])).toEqual([
      ['2026-07-31', '2026-12-31', 31],
      ['2027-01-01', null, 24],
    ])
  })
  it('switches in July only when the rate moved by 5 points or more', () => {
    const exactly5 = statutoryPeriods({ '2026-12-31': 30, '2027-06-30': 35 }, '2027-09-01')
    expect(exactly5.map((x) => [x.baslangic, x.oran])).toContainEqual(['2027-07-01', 28])
    const under5 = statutoryPeriods({ '2026-12-31': 30, '2027-06-30': 34.99 }, '2027-09-01')
    expect(under5.some((x) => x.baslangic === '2027-07-01')).toBe(false)
    const drop = statutoryPeriods({ '2026-12-31': 30, '2027-06-30': 25 }, '2027-09-01')
    expect(drop.map((x) => [x.baslangic, x.oran])).toContainEqual(['2027-07-01', 20])
  })
  it('does not apply the mid-year rule before 30 June has passed', () => {
    const p = statutoryPeriods({ '2026-12-31': 30, '2027-06-30': 50 }, '2027-03-01')
    expect(p.some((x) => x.baslangic === '2027-07-01')).toBe(false)
  })
  it('in the law year a triggered mid-year rule replaces the first period', () => {
    const p = statutoryPeriods({ '2025-12-31': 38.75, '2026-06-30': 30 }, '2026-10-25')
    expect(p.map((x) => [x.baslangic, x.bitis, x.oran])).toEqual([['2026-07-31', null, 24]])
  })
  it('returns nothing when the previous year-end rate is unknown', () => {
    expect(statutoryPeriods({}, '2026-10-25')).toEqual([])
  })
  it('rounds to two decimals', () => {
    const p = statutoryPeriods({ '2025-12-31': 38.77 }, '2026-10-25')
    expect(p[0].oran).toBe(31.02)
  })
})
