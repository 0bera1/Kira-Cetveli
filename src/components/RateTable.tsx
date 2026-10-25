import type { RateOption } from '../lib/rent/cpi'
import { formatPercent } from '../lib/rent/money'
import { formatMonth } from './Notices'
import styles from './RateTable.module.css'

/** Last-12-months view: one row per renewal month. */
export function RateTable({
  options,
  selected,
  onSelect,
}: {
  options: RateOption[]
  selected?: string
  onSelect?: (renewalMonth: string) => void
}) {
  if (options.length === 0) return null
  return (
    <table className={styles.table}>
      <caption>Son 12 ayın kira artış üst sınırı (TÜFE 12 aylık ortalama)</caption>
      <thead>
        <tr>
          <th scope="col">Yenileme ayı</th>
          <th scope="col" className={styles.hideSmall}>
            Veri ayı
          </th>
          <th scope="col">Oran</th>
          <th scope="col" className={styles.hideSmall}>
            Kaynak
          </th>
          {onSelect && (
            <th scope="col" className="visually-hidden">
              Seç
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {options.map((o) => (
          <tr key={o.renewalMonth} aria-selected={selected === o.renewalMonth || undefined}>
            <th scope="row">{formatMonth(o.renewalMonth)}</th>
            <td className={styles.hideSmall}>{formatMonth(o.dataMonth)}</td>
            <td className={styles.num}>{formatPercent(o.rate)}</td>
            <td className={styles.hideSmall}>
              {o.source === 'announced' ? 'Açıklanan' : 'Endeksten hesaplanan'}
            </td>
            {onSelect && (
              <td>
                <button type="button" onClick={() => onSelect(o.renewalMonth)}>
                  Kullan
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
