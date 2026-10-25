/**
 * EVDS helpers (pure functions).
 *
 * The request format below follows what maintained client libraries and TCMB notices describe for
 * EVDS 3: parameters are appended to the path with '&' (no '?'), dates are DD-MM-YYYY and the API
 * key travels in an HTTP header named "key". It could not be checked against the official user
 * guide while writing this, so the first run with a real key must confirm it (see README).
 */

export const DEFAULT_BASE = 'https://evds3.tcmb.gov.tr/igmevdsms-dis'
/**
 * General CPI index, 2025=100 (data group bie_tukfiy2025). Found by browsing the EVDS category list;
 * the older TP.FG.J0 (2003=100) series stops in January 2026. Re-check after any base-year change.
 */
export const DEFAULT_SERIES = 'TP.TUKFIY2025.GENEL'

export function formatEvdsDate(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}-${d.getUTCFullYear()}`
}

export function buildUrl(opts: { base: string; series: string; start: Date; end: Date }): string {
  const { base, series, start, end } = opts
  if (!/^[A-Za-z0-9_.-]+$/.test(series)) throw new Error('Invalid series code')
  const parts = [
    `series=${series}`,
    `startDate=${formatEvdsDate(start)}`,
    `endDate=${formatEvdsDate(end)}`,
    'type=json',
  ]
  return `${base.replace(/\/$/, '')}/${parts.join('&')}`
}

/** Converts "2025-9", "2025-09" or "09-2025" style EVDS month labels to YYYY-MM, or null. */
export function toMonthKey(label: string): string | null {
  const a = /^(\d{4})-(\d{1,2})$/.exec(label)
  if (a) return `${a[1]}-${a[2].padStart(2, '0')}`
  const b = /^(\d{1,2})-(\d{4})$/.exec(label)
  if (b) return `${b[2]}-${b[1].padStart(2, '0')}`
  return null
}

export function parseEvdsItems(payload: unknown, series: string): Record<string, number> {
  const items = (payload as { items?: unknown }).items
  if (!Array.isArray(items)) throw new Error('Unexpected EVDS response: no "items" array')
  const field = series.replace(/\./g, '_')
  const out: Record<string, number> = {}
  for (const item of items as Record<string, unknown>[]) {
    const month = typeof item.Tarih === 'string' ? toMonthKey(item.Tarih) : null
    const raw = item[field]
    if (!month || raw === null || raw === undefined || raw === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value) || value <= 0)
      throw new Error(`Invalid value for ${month}: ${String(raw)}`)
    out[month] = value
  }
  if (Object.keys(out).length === 0) throw new Error(`No usable values for field ${field}`)
  return out
}

export interface Diff {
  added: string[]
  changed: { month: string; from: number; to: number }[]
}

export function diffEndeks(before: Record<string, number>, after: Record<string, number>): Diff {
  const added: string[] = []
  const changed: Diff['changed'] = []
  for (const [m, v] of Object.entries(after)) {
    if (!(m in before)) added.push(m)
    else if (before[m] !== v) changed.push({ month: m, from: before[m], to: v })
  }
  return { added: added.sort(), changed }
}

/** Months between the first and last key that have no value. */
export function missingMonths(endeks: Record<string, number>): string[] {
  const keys = Object.keys(endeks).sort()
  if (keys.length < 2) return []
  const out: string[] = []
  const [sy, sm] = keys[0].split('-').map(Number)
  const [ey, em] = keys[keys.length - 1].split('-').map(Number)
  for (let i = sy * 12 + sm - 1; i <= ey * 12 + em - 1; i++) {
    const key = `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`
    if (!(key in endeks)) out.push(key)
  }
  return out
}

/** Largest relative month-over-month move; guards against unit/base mix-ups. */
export function maxMonthlyJump(
  endeks: Record<string, number>,
): { month: string; percent: number } | null {
  const keys = Object.keys(endeks).sort()
  let worst: { month: string; percent: number } | null = null
  for (let i = 1; i < keys.length; i++) {
    const p = Math.abs(endeks[keys[i]] / endeks[keys[i - 1]] - 1) * 100
    if (!worst || p > worst.percent) worst = { month: keys[i], percent: p }
  }
  return worst
}

/** A monthly move above this is treated as a data problem (e.g. an unchained base-year change). */
export const MAX_PLAUSIBLE_MONTHLY_PERCENT = 15

/** Daily series: items carry "Tarih" as DD-MM-YYYY. Returns ISO date -> value. */
export function parseEvdsDaily(payload: unknown, series: string): Record<string, number> {
  const items = (payload as { items?: unknown }).items
  if (!Array.isArray(items)) throw new Error('Unexpected EVDS response: no "items" array')
  const field = series.replace(/\./g, '_')
  const out: Record<string, number> = {}
  for (const item of items as Record<string, unknown>[]) {
    const m = typeof item.Tarih === 'string' ? /^(\d{2})-(\d{2})-(\d{4})$/.exec(item.Tarih) : null
    const raw = item[field]
    if (!m || raw === null || raw === undefined || raw === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid value on ${item.Tarih}`)
    out[`${m[3]}-${m[2]}-${m[1]}`] = value
  }
  if (Object.keys(out).length === 0) throw new Error(`No usable values for field ${field}`)
  return out
}
