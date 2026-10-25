import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { ToolPage } from '../../components/ToolPage'
import styles from './Checklist.module.css'

const groups: { title: string; items: string[] }[] = [
  {
    title: 'Taraflar ve taşınmaz',
    items: [
      'Ev sahibinin kimliği ve taşınmaz üzerindeki hakkı (tapu kaydı) kontrol edildi',
      'Taraf bilgileri (ad, TC kimlik no, adres) doğru yazıldı',
      'Taşınmazın adresi, bağımsız bölüm numarası ve kullanım amacı doğru yazıldı',
    ],
  },
  {
    title: 'Bedel ve ödeme',
    items: [
      'Aylık kira bedeli, ödeme günü ve ödeme yöntemi (banka hesabı) açıkça yazıldı',
      'Kira artışı maddesi inceleniyor: yasal sınırla uyumlu ve anlaşılır',
      'Depozito tutarı, nerede tutulacağı ve iade koşulları yazıldı',
      'Aidat, faturalar ve vergilerden kimin sorumlu olduğu belirlendi',
    ],
  },
  {
    title: 'Süre ve sona erme',
    items: [
      'Başlangıç tarihi ve kira süresi doğru yazıldı',
      'Yenileme ve sona erme koşulları okundu',
      'İmzalanması istenen ek belgeler (örneğin tahliye taahhüdü) dikkatle okundu; anlamadığınız belgeyi imzalamayın',
    ],
  },
  {
    title: 'Teslim ve kullanım',
    items: [
      'Demirbaş listesi hazırlandı, taşınmazın durumu fotoğraflandı',
      'Sayaç okumaları (elektrik, su, doğalgaz) not edildi',
      'Tadilat, boya ve onarım sorumlulukları belirlendi',
      'Alt kiralama ve evcil hayvan gibi kısıtlamalar okundu',
      'Her tarafın imzalı bir nüshası var',
    ],
  },
]

export default function SozlesmeKontrolListesi() {
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const [done, setDone] = useState<Set<string>>(new Set())
  const toggle = (item: string) =>
    setDone((s) => {
      const next = new Set(s)
      if (!next.delete(item)) next.add(item)
      return next
    })

  return (
    <ToolPage slug="sozlesme-kontrol-listesi">
      <div className={styles.toolbar}>
        <p aria-live="polite">
          <strong>
            {done.size}/{total}
          </strong>{' '}
          madde işaretlendi
        </p>
        <button type="button" onClick={() => window.print()}>
          Yazdır
        </button>
      </div>
      {groups.map((g) => (
        <section key={g.title} className={styles.group} aria-label={g.title}>
          <h2>{g.title}</h2>
          <ul>
            {g.items.map((item) => (
              <li key={item}>
                <button type="button" aria-pressed={done.has(item)} onClick={() => toggle(item)}>
                  <span className={styles.box}>
                    {done.has(item) && <Icon name="check" size={16} />}
                  </span>
                  <span>{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className={styles.note}>Bu liste genel bir hatırlatmadır, hukuki danışmanlık değildir.</p>
    </ToolPage>
  )
}
