import { z } from 'zod'

const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const tufeSchema = z.object({
  guncelleme: dateStr,
  dogrulanmamis: z.boolean().optional(),
  not: z.string().optional(),
  kaynak: z.object({ ad: z.string(), url: z.string().url() }),
  /** EVDS series code the index values came from (mixing base years would corrupt the ratios). */
  seri: z.string().optional(),
  /** Monthly CPI index, keyed by data month. */
  endeks: z.record(monthKey, z.number().positive().max(1e7)),
  /** Announced 12-month-average change (percent), keyed by data month. */
  ortalamaDegisim: z.record(monthKey, z.number().min(-50).max(500)),
})

export type TufeData = z.infer<typeof tufeSchema>

const sourced = {
  kaynak: z.string(),
  dogrulamaTarihi: dateStr.nullable(),
  dogrulanmali: z.boolean(),
}

export const yasalSchema = z.object({
  guncelleme: dateStr,
  dogrulanmamis: z.boolean().optional(),
  not: z.string().optional(),
  yasalFaiz: z.array(
    z.object({
      baslangic: dateStr,
      bitis: dateStr.nullable(),
      oran: z.number().min(0).max(500),
      ...sourced,
    }),
  ),
  kiraIstisnasi: z.array(
    z.object({ yil: z.number().int(), tutar: z.number().min(0).nullable(), ...sourced }),
  ),
  gelirVergisiTarifesi: z.array(
    z.object({
      yil: z.number().int(),
      dilimler: z
        .array(
          z.object({
            ust: z.number().positive().nullable(),
            oran: z.number().min(0).max(100),
          }),
        )
        .min(1),
      ...sourced,
    }),
  ),
  goturuGiderOrani: z.object({
    oran: z.number().min(0).max(100),
    kaynak: z.string(),
    dogrulanmali: z.boolean(),
  }),
  stopaj: z.array(
    z.object({
      tur: z.string(),
      oran: z.number().min(0).max(100),
      aciklama: z.string(),
      dogrulanmali: z.boolean(),
    }),
  ),
})

export type YasalData = z.infer<typeof yasalSchema>

export const STALE_AFTER_DAYS = 45

export function isStale(updated: string, now: Date = new Date()): boolean {
  const ms = now.getTime() - new Date(`${updated}T00:00:00Z`).getTime()
  return ms > STALE_AFTER_DAYS * 86_400_000
}
