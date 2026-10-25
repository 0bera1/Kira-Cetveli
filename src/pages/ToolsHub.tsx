import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { categories, toolPath, tools, type Category } from '../tools'
import styles from './ToolsHub.module.css'

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')

export default function ToolsHub() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const q = norm(query.trim())
  const matches = (t: (typeof tools)[number]) =>
    !q || norm(t.title).includes(q) || norm(t.description).includes(q)
  const visible = tools.filter((t) => matches(t) && (category === 'all' || t.category === category))
  const count = (c: Category | 'all') =>
    tools.filter((t) => matches(t) && (c === 'all' || t.category === c)).length

  return (
    <div className={styles.page}>
      <Seo
        title="Araçlar"
        description="Kira artışı, gecikme faizi, depozito, vergi tahmini, belge taslakları ve sözleşme takvimi araçları."
        path="/araclar"
      />
      <h1>Araçlar</h1>
      <div className={styles.search}>
        <label htmlFor="ara" className="visually-hidden">
          Araç ara
        </label>
        <Icon name="search" />
        <input
          id="ara"
          type="search"
          placeholder="Araç ara"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className={styles.layout}>
        <div className={styles.cats} role="group" aria-label="Kategoriler">
          {[{ id: 'all' as const, label: 'Tümü' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              <span>{c.label}</span>
              <span className={styles.badge}>{count(c.id)}</span>
            </button>
          ))}
        </div>
        <div aria-live="polite">
          {visible.length === 0 ? (
            <p className={styles.empty}>Eşleşen araç bulunamadı.</p>
          ) : (
            <ol className={styles.list}>
              {visible.map((t, i) => (
                <li key={t.slug}>
                  <Link to={toolPath(t)} className={t.status === 'soon' ? styles.soon : undefined}>
                    <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                    <Icon name={t.icon} />
                    <span className={styles.text}>
                      <strong>{t.title}</strong>
                      <span>{t.description}</span>
                    </span>
                    <span className={styles.status} data-status={t.status}>
                      {t.status === 'ready' ? 'Hazır' : 'Yakında'}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
