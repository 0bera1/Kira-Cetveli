import { useState } from 'react'
import { useData } from '../lib/data/DataContext'
import { DISCLAIMER, formatDateTr, textToBlocks } from '../lib/docs/templates'
import { downloadBlob, loadFontBytes } from '../lib/pdf/loadFonts'
import styles from './DocOutput.module.css'

/** Editable document text with PDF download and copy actions. Nothing leaves the browser. */
export function DocOutput({
  title,
  generated,
  filename,
}: {
  title: string
  generated: string
  filename: string
}) {
  const { tufe } = useData()
  const [edited, setEdited] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const text = edited ?? generated

  const today = new Date().toISOString().slice(0, 10)
  const footer = [
    DISCLAIMER,
    `Hazırlanma tarihi: ${formatDateTr(today)}.` +
      (tufe ? ` Oran verisi son güncelleme: ${formatDateTr(tufe.guncelleme)}.` : ''),
  ]

  const onPdf = async () => {
    setBusy(true)
    setStatus('')
    try {
      const { makePdf } = await import('../lib/pdf/makePdf')
      const bytes = await makePdf(
        { title, blocks: textToBlocks(text), footer },
        await loadFontBytes(),
      )
      downloadBlob(bytes as BlobPart, `${filename}.pdf`, 'application/pdf')
      setStatus('PDF indirildi.')
    } catch {
      setStatus('PDF oluşturulamadı. Metni kopyalayarak kullanabilirsiniz.')
    } finally {
      setBusy(false)
    }
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${footer.join('\n')}`)
      setStatus('Metin kopyalandı.')
    } catch {
      setStatus('Kopyalanamadı; metni seçip elle kopyalayın.')
    }
  }

  return (
    <div className={styles.wrap}>
      <label htmlFor="belge-metni" className={styles.label}>
        Belge metni (düzenleyebilirsiniz)
      </label>
      <textarea
        id="belge-metni"
        className={styles.text}
        value={text}
        rows={16}
        onChange={(e) => setEdited(e.target.value)}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onPdf} disabled={busy}>
          PDF indir
        </button>
        <button type="button" onClick={onCopy}>
          Metni kopyala
        </button>
        {edited !== null && (
          <button type="button" onClick={() => setEdited(null)}>
            Şablona dön
          </button>
        )}
      </div>
      <p role="status" className={styles.status}>
        {status}
      </p>
      <div className={styles.footer}>
        {footer.map((f) => (
          <p key={f}>{f}</p>
        ))}
      </div>
    </div>
  )
}
