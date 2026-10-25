import { crossCheck, rateForDataMonth } from '../../src/lib/rent/cpi'
import { tufeSchema, yasalSchema } from '../../src/lib/data/schemas'
import { MAX_PLAUSIBLE_MONTHLY_PERCENT, maxMonthlyJump, missingMonths } from './evds'

export interface ValidationReport {
  errors: string[]
  warnings: string[]
}

/** Full validation of the data files: schema, gaps, plausibility and the announced/computed cross-check. */
export function validateData(tufeJson: unknown, yasalJson: unknown): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []

  const tufe = tufeSchema.safeParse(tufeJson)
  if (!tufe.success) {
    errors.push(
      `tufe.json schema: ${tufe.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
    )
  } else {
    const t = tufe.data
    const gaps = missingMonths(t.endeks)
    if (gaps.length) errors.push(`endeks has missing months: ${gaps.join(', ')}`)
    const jump = maxMonthlyJump(t.endeks)
    if (jump && jump.percent > MAX_PLAUSIBLE_MONTHLY_PERCENT)
      errors.push(`implausible monthly index move in ${jump.month}: ${jump.percent.toFixed(2)}%`)
    for (const m of crossCheck(t))
      errors.push(
        `${m.month}: computed ${m.computed} differs from announced ${m.announced} by more than 0.02`,
      )
    const announcedOnly = Object.keys(t.ortalamaDegisim).filter(
      (m) => rateForDataMonth({ endeks: t.endeks, ortalamaDegisim: {} }, m) === null,
    )
    if (announcedOnly.length)
      warnings.push(
        `${announcedOnly.length} announced month(s) cannot be cross-checked (no index data)`,
      )
    if (t.dogrulanmamis) warnings.push('tufe.json is marked as unverified')
    if (!Date.parse(`${t.guncelleme}T00:00:00Z`))
      errors.push('tufe.json: guncelleme is not a valid date')
  }

  const yasal = yasalSchema.safeParse(yasalJson)
  if (!yasal.success) {
    errors.push(
      `yasal-oranlar.json schema: ${yasal.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
    )
  } else {
    const y = yasal.data
    const flagged = [
      ...y.yasalFaiz.filter((r) => r.dogrulanmali),
      ...y.kiraIstisnasi.filter((r) => r.dogrulanmali),
      ...y.gelirVergisiTarifesi.filter((r) => r.dogrulanmali),
    ].length
    if (flagged)
      warnings.push(`yasal-oranlar.json has ${flagged} entries still marked dogrulanmali`)
    const sorted = [...y.yasalFaiz].sort((a, b) => a.baslangic.localeCompare(b.baslangic))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      if (prev.bitis === null || prev.bitis >= sorted[i].baslangic)
        errors.push(`yasalFaiz periods overlap around ${sorted[i].baslangic}`)
    }
    for (const t of y.gelirVergisiTarifesi) {
      const uppers = t.dilimler.map((d) => d.ust)
      const finite = uppers.slice(0, -1)
      if (uppers[uppers.length - 1] !== null)
        errors.push(`tarife ${t.yil}: last bracket must be open ended`)
      if (finite.some((u, i) => u === null || (i > 0 && u <= (finite[i - 1] as number))))
        errors.push(`tarife ${t.yil}: bracket limits must increase`)
    }
  }

  return { errors, warnings }
}
