/**
 * Statutory interest under Law 3095 art. 1 as amended by Law 7589 art. 10 (Official Gazette
 * 31 July 2026, no. 33326): the annual rate is 80% of the CBRT rediscount rate in force on 31
 * December of the previous year. If the rate on 30 June differs from the 31 December rate by 5
 * points or more, the second half of the year uses 80% of the 30 June rate.
 */

export const LAW_START = '2026-07-31'
export const LAW_FACTOR = 0.8
export const MID_YEAR_THRESHOLD = 5

/** Rediscount rate by ISO date; days without a published value inherit the latest earlier one. */
export type RateByDate = Record<string, number>

export function rateOn(series: RateByDate, isoDate: string): number | null {
  let best: string | null = null
  for (const d of Object.keys(series)) if (d <= isoDate && (best === null || d > best)) best = d
  return best === null ? null : series[best]
}

export interface StatutoryPeriod {
  baslangic: string
  bitis: string | null
  oran: number
  /** Short description of how the value was derived, for the data file. */
  aciklama: string
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const prevDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Periods from the law start up to `today`. A year's first period starts on 1 January (31 July in
 * 2026); a mid-year period starts on 1 July when the 5-point rule triggers and 30 June is past.
 * The last period is open ended.
 */
export function statutoryPeriods(series: RateByDate, today: string): StatutoryPeriod[] {
  const out: StatutoryPeriod[] = []
  const lastYear = Number(today.slice(0, 4))
  for (let year = Number(LAW_START.slice(0, 4)); year <= lastYear; year++) {
    const dec = rateOn(series, `${year - 1}-12-31`)
    if (dec === null) continue
    const start = year === Number(LAW_START.slice(0, 4)) ? LAW_START : `${year}-01-01`
    if (start > today) break
    out.push({
      baslangic: start,
      bitis: null,
      oran: round2(dec * LAW_FACTOR),
      aciklama: `%80 x ${dec} (${year - 1}-12-31 reeskont oranı)`,
    })
    const june = `${year}-06-30`
    if (june < today) {
      const jun = rateOn(series, june)
      if (jun !== null && Math.abs(jun - dec) >= MID_YEAR_THRESHOLD) {
        // in the year the law took effect, the second-half rate applies from the law start
        // and the 31 December based first period never existed
        const lawYear = year === Number(LAW_START.slice(0, 4))
        if (lawYear) out.pop()
        out.push({
          baslangic: lawYear ? LAW_START : `${year}-07-01`,
          bitis: null,
          oran: round2(jun * LAW_FACTOR),
          aciklama: `%80 x ${jun} (${june} reeskont oranı; 31 Aralık oranından 5 puan veya daha fazla farklı)`,
        })
      }
    }
  }
  // close each period the day before the next one starts
  for (let i = 0; i < out.length - 1; i++) out[i].bitis = prevDay(out[i + 1].baslangic)
  return out
}
