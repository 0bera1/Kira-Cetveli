import { readFileSync } from 'node:fs'
import { validateData } from './lib/validate'

const read = (f: string): unknown => JSON.parse(readFileSync(`public/data/${f}`, 'utf8'))

const { errors, warnings } = validateData(read('tufe.json'), read('yasal-oranlar.json'))
for (const w of warnings) console.warn(`warning: ${w}`)
for (const e of errors) console.error(`error: ${e}`)
if (errors.length) {
  console.error(`\nData validation failed (${errors.length} error(s)).`)
  process.exit(1)
}
console.log('Data files are valid.')
