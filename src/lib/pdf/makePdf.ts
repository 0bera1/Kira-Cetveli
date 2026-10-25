import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont } from 'pdf-lib'

/**
 * The self-hosted font files are split into a "latin" and a "latin-ext" subset.
 * Turkish needs both: these letters only exist in the ext subset.
 */
const EXT_ONLY = /[ĞğŞşİ]/

export interface FontBytes {
  regular: { latin: ArrayBuffer | Uint8Array; ext: ArrayBuffer | Uint8Array }
  bold: { latin: ArrayBuffer | Uint8Array; ext: ArrayBuffer | Uint8Array }
}

interface FontSet {
  latin: PDFFont
  ext: PDFFont
}

function segments(text: string): { text: string; ext: boolean }[] {
  const out: { text: string; ext: boolean }[] = []
  for (const ch of text) {
    const ext = EXT_ONLY.test(ch)
    const last = out[out.length - 1]
    if (last && last.ext === ext) last.text += ch
    else out.push({ text: ch, ext })
  }
  return out
}

function widthOf(fonts: FontSet, text: string, size: number): number {
  return segments(text).reduce(
    (w, s) => w + (s.ext ? fonts.ext : fonts.latin).widthOfTextAtSize(s.text, size),
    0,
  )
}

export interface PdfBlock {
  text: string
  bold?: boolean
  size?: number
  /** Extra space after the block, in points. */
  gap?: number
}

export interface PdfInput {
  title: string
  blocks: PdfBlock[]
  /** Small lines printed at the bottom of the last page. */
  footer: string[]
}

const PAGE = { w: 595.28, h: 841.89, margin: 56 }

function wrap(fonts: FontSet, text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    if (para.trim() === '') {
      lines.push('')
      continue
    }
    let line = ''
    for (const word of para.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (line && widthOf(fonts, candidate, size) > maxWidth) {
        lines.push(line)
        line = word
      } else line = candidate
    }
    lines.push(line)
  }
  return lines
}

export async function makePdf(input: PdfInput, bytes: FontBytes): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  doc.setTitle(input.title)
  doc.setProducer('Kira Cetveli')
  doc.setCreator('Kira Cetveli')

  const embed = async (b: FontBytes['regular']): Promise<FontSet> => ({
    latin: await doc.embedFont(b.latin, { subset: false }),
    ext: await doc.embedFont(b.ext, { subset: false }),
  })
  const regular = await embed(bytes.regular)
  const bold = await embed(bytes.bold)

  let page = doc.addPage([PAGE.w, PAGE.h])
  let y = PAGE.h - PAGE.margin
  const maxWidth = PAGE.w - PAGE.margin * 2
  const ink = rgb(0.06, 0.1, 0.09)

  const drawLine = (text: string, fonts: FontSet, size: number) => {
    let x = PAGE.margin
    for (const s of segments(text)) {
      const font = s.ext ? fonts.ext : fonts.latin
      page.drawText(s.text, { x, y, size, font, color: ink })
      x += font.widthOfTextAtSize(s.text, size)
    }
  }

  const ensure = (lineHeight: number) => {
    if (y - lineHeight < PAGE.margin) {
      page = doc.addPage([PAGE.w, PAGE.h])
      y = PAGE.h - PAGE.margin
    }
  }

  const write = (text: string, fonts: FontSet, size: number, gap: number) => {
    const lineHeight = size * 1.45
    for (const line of wrap(fonts, text, size, maxWidth)) {
      ensure(lineHeight)
      y -= lineHeight
      if (line) drawLine(line, fonts, size)
    }
    y -= gap
  }

  write(input.title, bold, 18, 14)
  for (const b of input.blocks) write(b.text, b.bold ? bold : regular, b.size ?? 11, b.gap ?? 8)

  y -= 8
  ensure(60)
  page.drawLine({
    start: { x: PAGE.margin, y },
    end: { x: PAGE.w - PAGE.margin, y },
    thickness: 0.5,
    color: rgb(0.5, 0.55, 0.52),
    dashArray: [3, 3],
  })
  y -= 6
  for (const f of input.footer) write(f, regular, 8.5, 2)

  return doc.save()
}
