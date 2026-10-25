import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { addMonths } from '../../src/lib/rent/cpi'
import {
  buildUrl,
  diffEndeks,
  formatEvdsDate,
  maxMonthlyJump,
  missingMonths,
  parseEvdsItems,
  toMonthKey,
} from './evds'
import { validateData } from './validate'

const read = (f: string): unknown => JSON.parse(readFileSync(`public/data/${f}`, 'utf8'))

describe('evds helpers', () => {
  it('builds a path-style url without a query string', () => {
    const url = buildUrl({
      base: 'https://example.test/api/',
      series: 'TP.FG.J0',
      start: new Date(Date.UTC(2023, 0, 1)),
      end: new Date(Date.UTC(2026, 9, 25)),
    })
    expect(url).toBe(
      'https://example.test/api/series=TP.FG.J0&startDate=01-01-2023&endDate=25-10-2026&type=json',
    )
    expect(url).not.toContain('?')
  })
  it('rejects odd series codes', () => {
    expect(() =>
      buildUrl({ base: 'https://x.test', series: 'A&key=1', start: new Date(), end: new Date() }),
    ).toThrow()
  })
  it('formats dates', () => {
    expect(formatEvdsDate(new Date(Date.UTC(2026, 0, 5)))).toBe('05-01-2026')
  })
  it('normalizes month labels', () => {
    expect(toMonthKey('2025-9')).toBe('2025-09')
    expect(toMonthKey('2025-12')).toBe('2025-12')
    expect(toMonthKey('09-2025')).toBe('2025-09')
    expect(toMonthKey('garbage')).toBeNull()
  })
  it('parses items and skips empty values', () => {
    const out = parseEvdsItems(
      {
        items: [
          { Tarih: '2025-9', TP_FG_J0: '100.5' },
          { Tarih: '2025-10', TP_FG_J0: null },
        ],
      },
      'TP.FG.J0',
    )
    expect(out).toEqual({ '2025-09': 100.5 })
  })
  it('throws on malformed or invalid responses', () => {
    expect(() => parseEvdsItems({}, 'TP.FG.J0')).toThrow()
    expect(() => parseEvdsItems({ items: [] }, 'TP.FG.J0')).toThrow()
    expect(() =>
      parseEvdsItems({ items: [{ Tarih: '2025-9', TP_FG_J0: '-4' }] }, 'TP.FG.J0'),
    ).toThrow()
    expect(() =>
      parseEvdsItems({ items: [{ Tarih: '2025-9', TP_FG_J0: 'abc' }] }, 'TP.FG.J0'),
    ).toThrow()
  })
  it('diffs added and revised months', () => {
    const d = diffEndeks(
      { '2025-01': 1, '2025-02': 2 },
      { '2025-01': 1, '2025-02': 3, '2025-03': 4 },
    )
    expect(d.added).toEqual(['2025-03'])
    expect(d.changed).toEqual([{ month: '2025-02', from: 2, to: 3 }])
  })
  it('finds gaps and big jumps', () => {
    expect(missingMonths({ '2025-01': 1, '2025-04': 1 })).toEqual(['2025-02', '2025-03'])
    expect(maxMonthlyJump({ '2025-01': 100, '2025-02': 150 })!.percent).toBe(50)
  })
})

describe('data validation', () => {
  it('accepts the shipped data (with warnings only)', () => {
    const r = validateData(read('tufe.json'), read('yasal-oranlar.json'))
    expect(r.errors).toEqual([])
    expect(r.warnings.length).toBeGreaterThan(0)
  })
  it('flags a mismatch between index and announced rate', () => {
    const endeks: Record<string, number> = {}
    for (let i = 0; i < 24; i++) endeks[addMonths('2023-01', i)] = 100 * 1.02 ** i
    const tufe = { ...(read('tufe.json') as object), endeks, ortalamaDegisim: { '2024-12': 99 } }
    const r = validateData(tufe, read('yasal-oranlar.json'))
    expect(r.errors.some((e) => e.includes('differs from announced'))).toBe(true)
  })
  it('flags gaps and implausible jumps in the index', () => {
    const tufe = {
      ...(read('tufe.json') as object),
      endeks: { '2025-01': 100, '2025-02': 300, '2025-04': 301 },
      ortalamaDegisim: {},
    }
    const r = validateData(tufe, read('yasal-oranlar.json'))
    expect(r.errors.some((e) => e.includes('missing months'))).toBe(true)
    expect(r.errors.some((e) => e.includes('implausible'))).toBe(true)
  })
  it('flags overlapping legal-interest periods', () => {
    const yasal = read('yasal-oranlar.json') as { yasalFaiz: object[] }
    const bad = {
      ...yasal,
      yasalFaiz: [
        ...yasal.yasalFaiz,
        {
          baslangic: '2025-01-01',
          bitis: null,
          oran: 30,
          kaynak: 'x',
          dogrulamaTarihi: null,
          dogrulanmali: true,
        },
      ],
    }
    expect(validateData(read('tufe.json'), bad).errors.some((e) => e.includes('overlap'))).toBe(
      true,
    )
  })
})
