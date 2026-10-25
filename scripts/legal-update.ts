import { readFileSync, writeFileSync } from 'node:fs'
import { yasalSchema, type YasalData } from '../src/lib/data/schemas'
import { LAW_START, statutoryPeriods } from '../src/lib/rent/statutoryInterest'
import { buildUrl, DEFAULT_BASE, parseEvdsDaily } from './lib/evds'
import { validateData } from './lib/validate'

const FILE = 'public/data/yasal-oranlar.json'
const SERIES = process.env.EVDS_REESKONT_SERIES ?? 'TP.REESAVANS.RIO'
const dryRun = process.argv.includes('--dry-run')

const key = process.env.EVDS_API_KEY
if (!key) {
  console.error('EVDS_API_KEY is not set; statutory interest cannot be derived automatically.')
  process.exit(2)
}

const now = new Date()
const today = now.toISOString().slice(0, 10)
const url = buildUrl({
  base: process.env.EVDS_BASE ?? DEFAULT_BASE,
  series: SERIES,
  start: new Date(Date.UTC(2024, 11, 1)),
  end: now,
})
console.log(`Fetching ${SERIES} from ${new URL(url).host} ...`)
const res = await fetch(url, { headers: { key } })
if (!res.ok) {
  console.error(`EVDS request failed with HTTP ${res.status}.`)
  process.exit(1)
}
const rediscount = parseEvdsDaily(await res.json(), SERIES)
const periods = statutoryPeriods(rediscount, today)
if (periods.length === 0) {
  console.error('No statutory interest period could be derived (missing 31 December rate).')
  process.exit(1)
}

const current = yasalSchema.parse(JSON.parse(readFileSync(FILE, 'utf8')))
const source =
  '3095 sayılı Kanun m.1 (7589 sayılı Kanun m.10 ile değişik, RG 31.07.2026, 33326); TCMB reeskont oranı, EVDS ' +
  SERIES

const prevDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Entries before the law keep their values; an open-ended one is closed the day before the law.
const history = current.yasalFaiz
  .filter((r) => r.baslangic < LAW_START)
  .map((r) => (r.bitis === null ? { ...r, bitis: prevDay(LAW_START) } : r))

const generated = periods.map((p) => {
  const existing = current.yasalFaiz.find((r) => r.baslangic === p.baslangic && r.oran === p.oran)
  return {
    baslangic: p.baslangic,
    bitis: p.bitis,
    oran: p.oran,
    kaynak: `${source}: ${p.aciklama}`,
    // a value a person already flagged stays flagged until they clear it
    dogrulamaTarihi: existing?.dogrulamaTarihi ?? today,
    dogrulanmali: existing?.dogrulanmali ?? false,
  }
})

const next: YasalData = { ...current, yasalFaiz: [...history, ...generated] }
const same = JSON.stringify(next.yasalFaiz) === JSON.stringify(current.yasalFaiz)
for (const p of generated) console.log(`${p.baslangic} -> ${p.bitis ?? 'open'}: %${p.oran}`)
if (same) {
  console.log('No changes.')
  process.exit(0)
}
next.guncelleme = today

const report = validateData(JSON.parse(readFileSync('public/data/tufe.json', 'utf8')), next)
if (report.errors.length) {
  for (const e of report.errors) console.error(`error: ${e}`)
  console.error('\nDerived data failed validation; nothing was written.')
  process.exit(1)
}
if (dryRun) {
  console.log('Dry run: validation passed, file not written.')
  process.exit(0)
}
writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`)
console.log(`Wrote ${FILE}.`)
