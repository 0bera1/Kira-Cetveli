import { readFileSync, writeFileSync } from 'node:fs'
import { yasalSchema } from '../src/lib/data/schemas'
import { missingYearlyValues } from './lib/validate'

// Checks that the yearly tax values for the current year exist. When something is missing it
// writes issue.md (used by the legal-watch workflow to open an issue) and exits normally.
const data = yasalSchema.parse(JSON.parse(readFileSync('public/data/yasal-oranlar.json', 'utf8')))
const year = new Date().getUTCFullYear()
const missing = missingYearlyValues(data, year)

if (missing.length === 0) {
  console.log(`All yearly tax values for ${year} are present.`)
  process.exit(0)
}

const body = [
  `${year} yılı için aşağıdaki değerler \`public/data/yasal-oranlar.json\` dosyasında yok. Bu değerler her yıl aralık sonunda Gelir İdaresi tebliğiyle ilan edilir ve makine okunur bir kaynağı yoktur; elle eklenmesi gerekir.`,
  '',
  ...missing.map((m) => `- [ ] ${m}`),
  '',
  'Kaynak: Resmî Gazete, "Gelir Vergisi Genel Tebliği" (genellikle 31 Aralık mükerrer sayısı) ve GİB duyuruları.',
  'Ekledikten sonra `dogrulamaTarihi` alanını doldurup `dogrulanmali` değerini `false` yapın, ardından `npm run data:validate` çalıştırın.',
  '',
  'Eksik değerler tamamlanınca bu issue otomatik kapanır.',
].join('\n')
writeFileSync('issue.md', `${body}\n`)
console.log(`Missing yearly values for ${year}:\n- ${missing.join('\n- ')}`)
