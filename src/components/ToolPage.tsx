import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { related, toolPath, tools } from '../tools'
import { Icon } from './Icon'
import { Seo } from './Seo'
import styles from './ToolPage.module.css'

export function ToolPage({
  slug,
  children,
  jsonLd,
}: {
  slug: string
  children: ReactNode
  jsonLd?: object
}) {
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) throw new Error(`Unknown tool: ${slug}`)
  const others = related(slug)
  return (
    <article className={styles.page}>
      <Seo
        title={tool.title}
        description={tool.description}
        path={toolPath(tool)}
        jsonLd={
          jsonLd ?? {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.title,
            description: tool.description,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            inLanguage: 'tr',
          }
        }
      />
      <nav aria-label="Konum" className={styles.crumbs}>
        <Link to="/araclar">Araçlar</Link>
      </nav>
      <h1>{tool.title}</h1>
      <p className={styles.lead}>{tool.description}</p>
      {children}
      <section className={styles.related} aria-label="İlgili araçlar">
        <h2>İlgili araçlar</h2>
        <ul>
          {others.map((t) => (
            <li key={t.slug}>
              <Link to={toolPath(t)}>
                <Icon name={t.icon} />
                <span>{t.title}</span>
                <Icon name="arrow" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
