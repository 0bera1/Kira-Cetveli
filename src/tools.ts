import type { IconName } from './components/Icon'

export type Category = 'hesaplayici' | 'belge' | 'takip' | 'rehber'

export const categories: { id: Category; label: string }[] = [
  { id: 'hesaplayici', label: 'Hesaplayıcılar' },
  { id: 'belge', label: 'Belgeler' },
  { id: 'takip', label: 'Takip' },
  { id: 'rehber', label: 'Rehber' },
]

export interface Tool {
  slug: string
  title: string
  description: string
  category: Category
  icon: IconName
  status: 'ready' | 'soon'
  /** Guides live under /rehber, everything else under /araclar. */
  base: '/araclar' | '/rehber'
}

export const tools: Tool[] = [
  {
    slug: 'kira-artis-hesabi',
    title: 'Kira artış hesabı',
    description: 'Mevcut kira ve TÜFE 12 aylık ortalama oranıyla yeni kirayı hesaplayın.',
    category: 'hesaplayici',
    icon: 'calc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'gecikme-faizi',
    title: 'Gecikme faizi',
    description: 'Gecikmiş kira için gün sayısına göre faiz tahmini.',
    category: 'hesaplayici',
    icon: 'calc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'gecmis-donem-farki',
    title: 'Geçmiş dönem farkı',
    description: 'Yıllara göre uygulanmayan veya eksik uygulanan artışların toplamı.',
    category: 'hesaplayici',
    icon: 'calc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'depozito-iadesi',
    title: 'Depozito iadesi',
    description: 'Depozito ve faiziyle iade edilecek toplam tutar tahmini.',
    category: 'hesaplayici',
    icon: 'calc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'stopaj-ve-vergi',
    title: 'Stopaj ve vergi tahmini',
    description: 'Ev sahibi için yıllık kira geliri üzerinden gelir vergisi tahmini.',
    category: 'hesaplayici',
    icon: 'calc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'artis-ihtarnamesi',
    title: 'Kira artış bildirimi',
    description: 'Yazılı artış bildirimi taslağı; PDF veya düzenlenebilir metin.',
    category: 'belge',
    icon: 'doc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'tahliye-ve-depozito-yazisi',
    title: 'Tahliye ve depozito yazısı',
    description: 'Tahliye bildirimi ve depozito iade talebi için iki şablon.',
    category: 'belge',
    icon: 'doc',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'sozlesme-kontrol-listesi',
    title: 'Sözleşme kontrol listesi',
    description: 'İmzadan önce bakılacak maddeler; işaretlenebilir ve yazdırılabilir.',
    category: 'takip',
    icon: 'check',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'sozlesme-takvimi',
    title: 'Sözleşme takvimi',
    description: 'Yıldönümü, bildirim ve bitiş tarihleri için takvim dosyası (.ics).',
    category: 'takip',
    icon: 'calendar',
    status: 'ready',
    base: '/araclar',
  },
  {
    slug: 'bolge-kira-karsilastirma',
    title: 'Bölge kira karşılaştırma',
    description: 'Bölgenizdeki kira düzeyiyle karşılaştırma. Veri kaynağı bağlanınca açılacak.',
    category: 'takip',
    icon: 'map',
    status: 'soon',
    base: '/araclar',
  },
  {
    slug: 'kiraci-haklari',
    title: 'Kiracı hakları',
    description: 'Kiracının temel hakları ve dayanak mevzuat.',
    category: 'rehber',
    icon: 'book',
    status: 'ready',
    base: '/rehber',
  },
  {
    slug: 'ev-sahibi-yukumlulukleri',
    title: 'Ev sahibi yükümlülükleri',
    description: 'Ev sahibinin temel yükümlülükleri ve dayanak mevzuat.',
    category: 'rehber',
    icon: 'book',
    status: 'ready',
    base: '/rehber',
  },
]

export const toolPath = (t: Tool) => `${t.base}/${t.slug}`

export function related(slug: string, count = 3): Tool[] {
  const self = tools.find((t) => t.slug === slug)
  return tools
    .filter((t) => t.slug !== slug && t.status === 'ready')
    .sort((a, b) => Number(b.category === self?.category) - Number(a.category === self?.category))
    .slice(0, count)
}
