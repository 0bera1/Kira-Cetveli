import { readFileSync, writeFileSync } from 'node:fs'
import { tufeSchema } from '../src/lib/data/schemas'
import { averageChangeFromIndex } from '../src/lib/rent/cpi'
import { buildUrl, DEFAULT_BASE, DEFAULT_SERIES, diffEndeks, parseEvdsItems } from './lib/evds'
import { validateData } from './lib/validate'

const FILE = 'public/data/tufe.json'
const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')

const key = process.env.EVDS_API_KEY
if (!key) {
  console.error(
    [
      'EVDS_API_KEY is not set, so the index cannot be fetched automatically.',
      'Manual mode: edit public/data/tufe.json (endeks and/or ortalamaDegisim), then run `npm run data:validate`.',
      'To get a key: sign up at EVDS, open your profile page and generate an API key.',
    ].join('\n'),
  )
  process.exit(2)
}

const base = process.env.EVDS_BASE ?? DEFAULT_BASE
const series = process.env.EVDS_SERIES ?? DEFAULT_SERIES
const now = new Date()
const url = buildUrl({ base, series, start: new Date(Date.UTC(2023, 0, 1)), end: now })

// Only the host and series are logged; the key is never printed.
console.log(`Fetching ${series} from ${new URL(url).host} ...`)
const res = await fetch(url, { headers: { key } })
if (!res.ok) {
  console.error(
    `EVDS request failed with HTTP ${res.status}. Check the endpoint, key and series code.`,
  )
  process.exit(1)
}
const fetched = parseEvdsItems(await res.json(), series)

const current = tufeSchema.parse(JSON.parse(readFileSync(FILE, 'utf8')))
// A different series (e.g. a new base year) must replace the old values, never be mixed into them.
const sameSeries = current.seri === series
if (!sameSeries)
  console.log(
    `Series changed (${current.seri ?? 'unknown'} -> ${series}): replacing the whole index.`,
  )
const next = {
  ...current,
  seri: series,
  endeks: sameSeries ? { ...current.endeks, ...fetched } : fetched,
}
const diff = diffEndeks(current.endeks, next.endeks)

console.log(`Added months: ${diff.added.length ? diff.added.join(', ') : 'none'}`)
for (const c of diff.changed) console.log(`Revised ${c.month}: ${c.from} -> ${c.to}`)
if (diff.added.length === 0 && diff.changed.length === 0) {
  console.log('No changes.')
  process.exit(0)
}

// Everything announced must now agree with the computed value before the data is called verified.
const sortedKeys = Object.keys(next.endeks).sort()
const endeks: Record<string, number> = Object.fromEntries(
  sortedKeys.map((k) => [k, next.endeks[k]]),
)
const output = {
  ...next,
  endeks,
  guncelleme: now.toISOString().slice(0, 10),
  kaynak: {
    ad: 'TÜİK; endeks verisi TCMB EVDS',
    url: current.kaynak.url,
  },
}

const report = validateData(
  output,
  JSON.parse(readFileSync('public/data/yasal-oranlar.json', 'utf8')),
)
for (const w of report.warnings) console.warn(`warning: ${w}`)
if (report.errors.length) {
  for (const e of report.errors) console.error(`error: ${e}`)
  console.error('\nNew data failed validation; nothing was written.')
  process.exit(1)
}

const stillUnchecked = Object.keys(output.ortalamaDegisim).some(
  (m) => averageChangeFromIndex(output.endeks, m) === null,
)
if (!stillUnchecked) delete (output as { dogrulanmamis?: boolean }).dogrulanmamis

if (dryRun) {
  console.log('Dry run: validation passed, file not written.')
  process.exit(0)
}
writeFileSync(FILE, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${FILE}.`)
