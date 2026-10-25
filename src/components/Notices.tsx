import { useData } from '../lib/data/DataContext'
import { isStale } from '../lib/data/schemas'
import styles from './Notices.module.css'

const monthNames = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

export function formatMonth(key: string): string {
  const [y, m] = key.split('-')
  return `${monthNames[Number(m) - 1]} ${y}`
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${Number(d)} ${monthNames[Number(m) - 1]} ${y}`
}

/** Disclaimer + data freshness line shown under every result and document. */
export function ResultNotice({ rates = true }: { rates?: boolean }) {
  const { tufe, error } = useData()
  return (
    <div className={styles.notice}>
      {error && (
        <p className={styles.warn} role="alert">
          Güncel veri dosyası alınamadı; yayın anındaki veri gösteriliyor. Oranı resmî kaynaktan
          doğrulayın.
        </p>
      )}
      {tufe && isStale(tufe.guncelleme) && (
        <p className={styles.warn} role="alert">
          Veri 45 günden eski. Sonuçlar güncel olmayabilir; resmî kaynaktan doğrulayın.
        </p>
      )}
      {rates && tufe?.dogrulanmamis && (
        <p className={styles.warn}>Şu an kullanılan oran teyit edilmemiş örnek veridir.</p>
      )}
      {tufe && <p>Veri son güncelleme: {formatDate(tufe.guncelleme)}</p>}
      <p>
        Bu bir hesaplama ve taslak aracıdır, hukuki danışmanlık değildir. Önemli kararlardan önce
        bir avukata danışın.
      </p>
    </div>
  )
}
