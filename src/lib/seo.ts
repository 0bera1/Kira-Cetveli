export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'tr',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

/** Absolute site origin for canonical/OG URLs; empty when VITE_SITE_URL is not set. */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
