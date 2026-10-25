import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { makePdf, type FontBytes } from '../pdf/makePdf'
import {
  formatDateTr,
  increaseNoticeText,
  leaveNoticeText,
  textToBlocks,
  DISCLAIMER,
} from './templates'

const font = (f: string) => new Uint8Array(readFileSync(`public/fonts/${f}`))
const bytes: FontBytes = {
  regular: {
    latin: font('instrument-sans-latin-400-normal.woff2'),
    ext: font('instrument-sans-latin-ext-400-normal.woff2'),
  },
  bold: {
    latin: font('instrument-sans-latin-700-normal.woff2'),
    ext: font('instrument-sans-latin-ext-700-normal.woff2'),
  },
}

const base = {
  sender: 'Ayşe Yıldız',
  recipient: 'Mehmet Öztürk',
  address: 'Gül Sokak No: 5 Daire: 3, Çankaya / Ankara',
  currentRent: 10000,
  newRent: 13149,
  ratePercent: 31.49,
  effectiveDate: '2026-11-01',
  date: '2026-10-25',
}

describe('document templates', () => {
  it('fills the increase notice with formatted values', () => {
    const t = increaseNoticeText(base)
    expect(t).toContain('₺10.000,00')
    expect(t).toContain('₺13.149,00')
    expect(t).toContain('%31,49')
    expect(t).toContain('1 Kasım 2026')
    expect(t).toContain('madde 344')
  })
  it('leaves visible blanks for empty fields', () => {
    const t = increaseNoticeText({ ...base, sender: '', currentRent: 0, effectiveDate: '' })
    expect(t).toContain('Gönderen: ..........')
    expect(t).toContain('...')
  })
  it('has two leave templates', () => {
    const common = {
      sender: 'A',
      recipient: 'B',
      address: 'C',
      date: '2026-10-25',
      moveOutDate: '2026-12-01',
    }
    expect(leaveNoticeText({ ...common, kind: 'tahliye', deposit: 0, iban: '' })).toContain(
      'Tahliye bildirimi',
    )
    const d = leaveNoticeText({ ...common, kind: 'depozito', deposit: 20000, iban: 'TR00' })
    expect(d).toContain('Depozito iade talebi')
    expect(d).toContain('₺20.000,00')
  })
  it('formats dates safely', () => {
    expect(formatDateTr('2026-02-29')).not.toBe('')
    expect(formatDateTr('bad')).toBe('...')
  })
})

describe('pdf generation', () => {
  it('renders Turkish text into a non-empty valid PDF', async () => {
    const pdf = await makePdf(
      {
        title: 'Kira artışı bildirimi ĞğŞşİıÇçÖöÜü',
        blocks: textToBlocks(increaseNoticeText(base)),
        footer: [DISCLAIMER, 'Oran verisi son güncelleme: 25 Ekim 2026.'],
      },
      bytes,
    )
    expect(pdf.length).toBeGreaterThan(5000)
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
    const loaded = await PDFDocument.load(pdf)
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1)
  })
  it('paginates long text', async () => {
    const long = Array.from({ length: 120 }, (_, i) => `Satır ${i} ğüşiöç `.repeat(8)).join('\n\n')
    const pdf = await makePdf(
      { title: 'Uzun', blocks: textToBlocks(long), footer: [DISCLAIMER] },
      bytes,
    )
    expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(1)
  })
})
