import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tools, toolPath } from '../src/tools'

const dist = 'dist'
const site = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const base = (process.env.VITE_BASE ?? '/').replace(/\/?$/, '/')

mkdirSync(dist, { recursive: true })

if (site) {
  const paths = [
    '/',
    '/araclar',
    ...tools.map(toolPath),
    '/veri-kaynaklari',
    '/gizlilik',
    '/hakkinda',
  ]
  const urls = paths
    .map((p) => `  <url><loc>${site}${base.replace(/\/$/, '')}${p === '/' ? '/' : p}</loc></url>`)
    .join('\n')
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
  writeFileSync(
    join(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${site}${base}sitemap.xml\n`,
  )
} else {
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n')
  console.log('VITE_SITE_URL not set: sitemap.xml skipped (it needs absolute URLs).')
}

// GitHub Pages serves 404.html for unknown paths. Use the app shell with an empty root so the
// client router renders the NotFound page instead of hydrating mismatched prerendered markup.
import { readFileSync } from 'node:fs'
const index = readFileSync(join(dist, 'index.html'), 'utf8')
const shell = index.replace(
  /<div id="root"[^>]*>[\s\S]*?<\/div>(\s*<script)/,
  '<div id="root"></div>$1',
)
writeFileSync(
  join(dist, '404.html'),
  shell.replace(/<script>window\.__staticRouterHydrationData[\s\S]*?<\/script>/, ''),
)

// The head tags injected during prerendering end up before <meta charset>, which browsers want
// within the first 1024 bytes. Move it to the very top of every page.
function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return htmlFiles(path)
    return name.endsWith('.html') ? [path] : []
  })
}
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8')
  const charset = /<meta charset="UTF-8"\s*\/?>/i.exec(html)
  if (!charset) continue
  const moved = html.replace(charset[0], '').replace(/<head>/, `<head>${charset[0]}`)
  writeFileSync(file, moved)
}
