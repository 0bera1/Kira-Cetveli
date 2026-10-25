import { useState } from 'react'
import { formatMonth, ResultNotice } from '../../components/Notices'
import { Field, Paper, Result, SelectField } from '../../components/Paper'
import { RateTable } from '../../components/RateTable'
import { RulerGauge } from '../../components/RulerGauge'
import { ToolPage } from '../../components/ToolPage'
import { useRateChoice } from '../../lib/useRateChoice'
import { computeIncrease } from '../../lib/rent/increase'
import { formatLira, formatPercent, parseNumber } from '../../lib/rent/money'

export default function KiraArtisHesabi() {
  const [rent, setRent] = useState('10.000')
  const choice = useRateChoice()
  const result = computeIncrease(parseNumber(rent), choice.rate)

  const monthOptions = choice.options.map((o) => ({
    value: o.renewalMonth,
    label: `${formatMonth(o.renewalMonth)} yenilemesi: ${formatPercent(o.rate)}`,
  }))

  return (
    <ToolPage slug="kira-artis-hesabi">
      <Paper title="HESAP PUSULASI">
        <Field id="kira" label="Mevcut aylık kira" value={rent} onChange={setRent} suffix="₺" />
        {monthOptions.length > 0 && (
          <SelectField
            id="yenileme"
            label="Sözleşme yıldönümü (yenileme ayı)"
            value={choice.selected}
            onChange={choice.setSelected}
            options={monthOptions}
            hint="Seçtiğiniz ayın oranı aşağıdaki alana otomatik gelir."
          />
        )}
        <Field
          id="oran"
          label="Uygulanacak artış oranı"
          value={choice.rateText}
          onChange={choice.setRateText}
          suffix="%"
          hint={
            choice.overridden
              ? 'Elle girildi. Oranı sözleşmenize ve mevzuata göre doğrulayın.'
              : choice.option
                ? `${formatMonth(choice.option.dataMonth)} TÜFE verisine göre üst sınır.`
                : 'Oran verisi yüklenemedi; elle girin.'
          }
        />
        <RulerGauge value={choice.rate} />
        {result.ok ? (
          <Result
            label="Yeni aylık kira"
            value={formatLira(result.value.newRent)}
            rows={[
              { label: 'Aylık fark', value: formatLira(result.value.monthlyDiff) },
              { label: 'Yıllık fark', value: formatLira(result.value.yearlyDiff) },
              { label: 'Yıllık toplam', value: formatLira(result.value.newRent * 12) },
            ]}
          />
        ) : (
          <Result
            label=""
            error={
              result.error === 'invalid-rent'
                ? 'Geçerli bir aylık kira tutarı girin.'
                : 'Geçerli bir artış oranı girin (0 ile 1000 arasında).'
            }
          />
        )}
        <ResultNotice />
      </Paper>
      <div style={{ marginTop: 28 }}>
        <RateTable
          options={choice.options}
          selected={choice.selected}
          onSelect={choice.setSelected}
        />
      </div>
    </ToolPage>
  )
}
