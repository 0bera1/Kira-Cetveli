import { z } from 'zod'

const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

export const tufeSchema = z.object({
  guncelleme: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dogrulanmamis: z.boolean().optional(),
  not: z.string().optional(),
  kaynak: z.object({ ad: z.string(), url: z.string().url() }),
  endeks: z.record(monthKey, z.number().positive().max(1e6)),
  ortalamaDegisim: z.record(monthKey, z.number().min(-50).max(500)),
})

export type TufeData = z.infer<typeof tufeSchema>

/** Latest month key that has an announced 12-month average change. */
export function latestAverageChange(data: TufeData): { month: string; rate: number } | null {
  const months = Object.keys(data.ortalamaDegisim).sort()
  const month = months[months.length - 1]
  return month ? { month, rate: data.ortalamaDegisim[month] } : null
}

export const STALE_AFTER_DAYS = 45

export function isStale(updated: string, now: Date = new Date()): boolean {
  const ms = now.getTime() - new Date(`${updated}T00:00:00Z`).getTime()
  return ms > STALE_AFTER_DAYS * 86_400_000
}
