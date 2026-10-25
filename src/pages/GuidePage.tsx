import { Link } from 'react-router-dom'
import { Faq } from '../components/Faq'
import { Seo } from '../components/Seo'
import { REVIEW_NOTE, type Guide } from '../content/guides'
import { faqJsonLd } from '../lib/seo'
import styles from './Prose.module.css'

export default function GuidePage({ guide }: { guide: Guide }) {
  return (
    <article className={styles.prose}>
      <Seo
        title={guide.title}
        description={guide.intro}
        path={`/rehber/${guide.slug}`}
        jsonLd={faqJsonLd(guide.faq)}
      />
      <nav aria-label="Konum">
        <Link to="/araclar">Araçlar</Link>
      </nav>
      <h1>{guide.title}</h1>
      <p className={styles.lead}>{guide.intro}</p>
      {guide.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.refs && (
            <p className={styles.refs}>
              Dayanak: <strong>{s.refs.join('; ')}</strong>
            </p>
          )}
        </section>
      ))}
      <Faq items={guide.faq} />
      <p className={styles.note}>{REVIEW_NOTE}</p>
      <p className={styles.note}>Bu içerik genel bilgilendirmedir, hukuki danışmanlık değildir.</p>
    </article>
  )
}
