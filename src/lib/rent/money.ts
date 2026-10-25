/** Money is handled as integer kurus; rounding rules live only here. */
export type Kurus = number

export function toKurus(lira: number): Kurus {
  return Math.round((lira + Number.EPSILON) * 100)
}

export function fromKurus(kurus: Kurus): number {
  return kurus / 100
}

const lira = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatLira(kurus: Kurus): string {
  return `₺${lira.format(fromKurus(kurus))}`
}

export function formatPercent(value: number, digits = 2): string {
  return `%${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}`
}

/** Parses Turkish-style input ("1.234,56" or "1234,56" or "1234.56"). Returns null if invalid. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace(/₺|%/g, '')
  if (s === '') return null
  let normalized: string
  if (s.includes(',')) normalized = s.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) normalized = s.replace(/\./g, '')
  else normalized = s
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}
