import type { FontBytes } from './makePdf'

async function get(file: string): Promise<ArrayBuffer> {
  const res = await fetch(`${import.meta.env.BASE_URL}fonts/${file}`)
  if (!res.ok) throw new Error(`Font could not be loaded: ${file}`)
  return res.arrayBuffer()
}

/** Fetches the self-hosted woff2 files (same origin). */
export async function loadFontBytes(): Promise<FontBytes> {
  const [rl, re, bl, be] = await Promise.all([
    get('instrument-sans-latin-400-normal.woff2'),
    get('instrument-sans-latin-ext-400-normal.woff2'),
    get('instrument-sans-latin-700-normal.woff2'),
    get('instrument-sans-latin-ext-700-normal.woff2'),
  ])
  return { regular: { latin: rl, ext: re }, bold: { latin: bl, ext: be } }
}

export function downloadBlob(data: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
