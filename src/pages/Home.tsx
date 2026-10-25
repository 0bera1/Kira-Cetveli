import { useState } from 'react'
import { Checklist } from '../components/Checklist'
import { Faq, type FaqItem } from '../components/Faq'
import { Field, Paper } from '../components/Paper'
import { formatMonth, ResultNotice } from '../components/Notices'
import { RulerGauge } from '../components/RulerGauge'
import { Seo } from '../components/Seo'
import { computeIncrease } from '../lib/rent/increase'
import { formatLira, formatPercent, parseNumber } from '../lib/rent/money'
import { useRateChoice } from '../lib/useRateChoice'
import { useData } from '../lib/data/DataContext'
import { useRole } from '../lib/role'
import { faqJsonLd } from '../lib/seo'
import styles from './Home.module.css'

const faq: FaqItem[] = [
  {
    q: 'Bu sonuç bağlayıcı mı?',
    a: 'Hayır. Bu araç, girdiğiniz değerlerle bir hesaplama yapar. Hukuki bağlayıcılığı yoktur; kesin tutar için resmî kaynakları ve gerekirse bir avukatı esas alın.',
  },
  {
    q: 'Artış oranı neye göre belirlenir?',
    a: 'Konut ve çatılı iş yeri kiralarında artış, Türk Borçlar Kanunu madde 344 uyarınca bir önceki kira yılındaki TÜFE 12 aylık ortalama değişimini aşamaz. Güncel yasal durumu resmî kaynaktan doğrulayın.',
  },
  {
    q: 'Girdiğim rakamlar bir yere gönderiliyor mu?',
    a: 'Hayır. Tüm hesaplar tarayıcınızda yapılır; kira tutarınız ve diğer bilgileriniz cihazınızdan çıkmaz.',
  },
]

const copy = {
  tenant: {
    title: 'Kirana gelen zam doğru mu? Pusulayla kontrol et.',
    result: 'Ödeyeceğin yeni kira',
  },
  landlord: {
    title: 'Kira artışını doğru ve hızlı hesapla.',
    result: 'İsteyebileceğin yeni kira',
  },
} as const

export default function Home() {
  const [role] = useRole()
  const { tufe } = useData()
  const choice = useRateChoice()
  const [rent, setRent] = useState('10.000')
  const rate = choice.rate
  const rateText = choice.rateText
  const latest = choice.option
  const rateOverride = choice.overridden ? choice.rateText : null
  const setRateOverride = choice.setRateText
  const result = computeIncrease(parseNumber(rent), rate)

  let rateHint = 'Oran verisi yüklenemedi; elle girin.'
  if (latest && tufe) {
    rateHint =
      rateOverride === null
        ? `Kaynak: ${tufe.kaynak.ad}, ${formatMonth(latest.dataMonth)}. Düzenleyebilirsiniz.`
        : `Elle girildi. Güncel TÜFE 12 aylık ortalama: ${formatPercent(latest.rate)}.`
  }

  return (
    <>
      <Seo
        title="Kira artışı hesaplama ve takip araçları"
        description="Kira artışını TÜFE 12 aylık ortalamaya göre hesaplayın; gecikme faizi, depozito, belge ve takvim araçları. Verileriniz cihazınızdan çıkmaz."
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Kira Cetveli',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            inLanguage: 'tr',
          },
          faqJsonLd(faq),
        ]}
      />
      <div className={styles.grid}>
        <div>
          <h1 className={styles.hero}>{copy[role].title}</h1>
          <Paper title="HESAP PUSULASI">
            <Field id="kira" label="Mevcut aylık kira" value={rent} onChange={setRent} suffix="₺" />
            <Field
              id="oran"
              label="Uygulanacak artış oranı"
              value={rateText}
              onChange={setRateOverride}
              suffix="%"
              hint={rateHint}
            />
            <RulerGauge value={rate} />
            <div className={styles.result} aria-live="polite">
              {result.ok ? (
                <>
                  <p className={styles.label}>{copy[role].result}</p>
                  <p className={styles.big} data-testid="new-rent">
                    {formatLira(result.value.newRent)}
                  </p>
                  <dl className={styles.diffs}>
                    <div>
                      <dt>Aylık fark</dt>
                      <dd>{formatLira(result.value.monthlyDiff)}</dd>
                    </div>
                    <div>
                      <dt>Yıllık fark</dt>
                      <dd>{formatLira(result.value.yearlyDiff)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className={styles.error}>
                  {result.error === 'invalid-rent'
                    ? 'Geçerli bir aylık kira tutarı girin.'
                    : 'Geçerli bir artış oranı girin (0 ile 1000 arasında).'}
                </p>
              )}
            </div>
            <ResultNotice />
          </Paper>
        </div>
        <aside className={styles.side}>
          <Checklist />
          <Faq items={faq} />
        </aside>
      </div>
    </>
  )
}
