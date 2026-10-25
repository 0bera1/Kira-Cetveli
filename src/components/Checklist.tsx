import { useState } from 'react'
import { Icon } from './Icon'
import styles from './Checklist.module.css'

const steps = [
  'Sözleşme yıldönümünü kontrol et',
  'Güncel TÜFE oranını al',
  'Yeni kirayı hesapla',
  'Yazılı bildirim hazırla',
  'Ödeme planını ve takvimi not et',
]

export function Checklist() {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false))
  const count = done.filter(Boolean).length
  return (
    <section className={styles.card} aria-label="Artış kontrol listesi">
      <div className={styles.head}>
        <h2>Artış kontrol listesi</h2>
        <span aria-live="polite">
          {count}/{steps.length}
        </span>
      </div>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={count}
        aria-label="Tamamlanan adımlar"
      >
        <div style={{ width: `${(count / steps.length) * 100}%` }} />
      </div>
      <ul>
        {steps.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              aria-pressed={done[i]}
              onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            >
              <span className={styles.box}>{done[i] && <Icon name="check" size={16} />}</span>
              <span className={done[i] ? styles.done : undefined}>{s}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
