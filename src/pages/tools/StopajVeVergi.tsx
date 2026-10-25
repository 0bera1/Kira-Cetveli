import { useState } from 'react'
import { ResultNotice } from '../../components/Notices'
import { Field, Paper, Result, SelectField } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { useData } from '../../lib/data/DataContext'
import { formatLira, formatPercent, parseNumber } from '../../lib/rent/money'
import { estimateRentTax } from '../../lib/rent/tax'

export default function StopajVeVergi() {
  const { yasal } = useData()
  const [year, setYear] = useState('')
  const [income, setIncome] = useState('240.000')
  const [method, setMethod] = useState('goturu')
  const [actual, setActual] = useState('0')
  const [exemptionOverride, setExemptionOverride] = useState<string | null>(null)

  const years = yasal
    ? [...new Set(yasal.kiraIstisnasi.map((k) => k.yil))].sort((a, b) => b - a)
    : []
  const selectedYear = Number(year || years[0])
  const exemptionRow = yasal?.kiraIstisnasi.find((k) => k.yil === selectedYear)
  const tariff = yasal?.gelirVergisiTarifesi.find((t) => t.yil === selectedYear)
  const exemptionDefault =
    exemptionRow?.tutar != null ? String(exemptionRow.tutar).replace('.', ',') : ''
  const exemptionText = exemptionOverride ?? exemptionDefault

  const result =
    tariff && parseNumber(income) !== null && parseNumber(exemptionText) !== null
      ? estimateRentTax(
          parseNumber(income)!,
          parseNumber(exemptionText)!,
          method === 'goturu'
            ? { kind: 'goturu', ratePercent: yasal!.goturuGiderOrani.oran }
            : { kind: 'gercek', amount: parseNumber(actual) ?? NaN },
          tariff.dilimler,
        )
      : null

  const unverified = exemptionRow?.dogrulanmali || tariff?.dogrulanmali

  return (
    <ToolPage slug="stopaj-ve-vergi">
      <Paper title="HESAP PUSULASI">
        {years.length > 0 && (
          <SelectField
            id="yil"
            label="Vergi yılı"
            value={String(selectedYear)}
            onChange={(v) => {
              setYear(v)
              setExemptionOverride(null)
            }}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
          />
        )}
        <Field
          id="gelir"
          label="Yıllık brüt kira geliri"
          value={income}
          onChange={setIncome}
          suffix="₺"
        />
        <Field
          id="istisna"
          label="Kira geliri istisna tutarı"
          value={exemptionText}
          onChange={setExemptionOverride}
          suffix="₺"
          hint={
            exemptionDefault
              ? 'Veri dosyasından geldi; düzenleyebilirsiniz.'
              : 'Bu yıl için veri yok; güncel tutarı resmî kaynaktan girin.'
          }
        />
        <SelectField
          id="gider"
          label="Gider yöntemi"
          value={method}
          onChange={setMethod}
          options={[
            { value: 'goturu', label: `Götürü gider (%${yasal?.goturuGiderOrani.oran ?? '-'})` },
            { value: 'gercek', label: 'Gerçek gider' },
          ]}
        />
        {method === 'gercek' && (
          <Field
            id="gercek"
            label="Yıllık gerçek gider toplamı"
            value={actual}
            onChange={setActual}
            suffix="₺"
          />
        )}
        {!tariff && yasal && (
          <p role="alert" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {selectedYear} yılı için vergi tarifesi veri dosyasında yok. Tarife eklenene kadar hesap
            yapılamaz.
          </p>
        )}
        {result ? (
          <Result
            label="Tahmini gelir vergisi"
            value={formatLira(result.tax)}
            rows={[
              { label: 'Vergi matrahı', value: formatLira(result.taxableBase) },
              { label: 'Gider', value: formatLira(result.expense) },
              { label: 'İstisna', value: formatLira(result.exemption) },
              { label: 'Efektif oran', value: formatPercent(result.effectivePercent) },
            ]}
          />
        ) : (
          tariff && <Result label="" error="Gelir, istisna ve gider için geçerli değerler girin." />
        )}
        {unverified && (
          <p style={{ marginTop: 12, fontWeight: 600 }}>
            Bu yıla ait oran ve eşikler henüz resmî kaynaktan doğrulanmamıştır; beyan öncesi
            doğrulayın.
          </p>
        )}
        <div style={{ marginTop: 16, fontSize: '0.88rem', color: 'var(--muted)' }}>
          <p style={{ fontWeight: 600 }}>Stopaj oranları (veri dosyasından)</p>
          <ul>
            {yasal?.stopaj.map((s) => (
              <li key={s.tur}>
                {s.tur === 'konut' ? 'Konut' : 'İş yeri'}: {formatPercent(s.oran, 0)}. {s.aciklama}
              </li>
            ))}
          </ul>
        </div>
        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
          Bu sonuç kesin vergi beyanı değildir; yalnızca tahmindir.
        </p>
        <ResultNotice />
      </Paper>
    </ToolPage>
  )
}
