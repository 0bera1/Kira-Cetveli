import { Head } from 'vite-react-ssg'

interface SeoProps {
  title: string
  description: string
  path: string
  jsonLd?: object
}

const SITE = 'Kira Cetveli'

export function Seo({ title, description, path, jsonLd }: SeoProps) {
  const full = path === '/' ? `${SITE} - ${title}` : `${title} | ${SITE}`
  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:url" content={path} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Head>
  )
}
