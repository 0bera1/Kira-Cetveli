import { useState } from 'react'
import { ResultNotice } from '../../components/Notices'
import { Field, Paper, Result } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { useData } from '../../lib/data/DataContext'
import { simpleInterest } from '../../lib/rent/interest'
import { legalInterestOn } from '../../lib/rent/legalRate'
import { formatLira, parseNumber, toKurus } from '../../lib/rent/money'

export default function GecikmeFaizi() {
  const { yasal } = useData()
  const [amount, setAmount] = useState('10.000')
  const [days, setDays] = useState('30')
  const [rateOverride, setRateOverride] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const legal = yasal ? legalInterestOn(yasal, today) : null
  const rateText = rateOverride ?? (legal !== null ? String(legal).replace('.', ',') : '')

  const a = parseNumber(amount)
  const d = parseNumber(days)
  const r = parseNumber(rateText)
  const interest = a !== null && d !== null && r !== null ? simpleInterest(a, r, d) : null

  return (
    <ToolPage slug="gecikme-faizi">
      <Paper title="HESAP PUSULASI">
        <Field
          id="tutar"
          label="Gecikmiş kira tutarı"
          value={amount}
          onChange={setAmount}
          suffix="₺"
        />
        <Field
          id="gun"
          label="Gecikme süresi"
          value={days}
          onChange={setDays}
          suffix="gün"
          inputMode="numeric"
        />
        <Field
          id="faiz"
          label="Yıllık faiz oranı"
          value={rateText}
          onChange={setRateOverride}
          suffix="%"
          hint={
            legal !== null && rateOverride === null
              ? 'Veri dosyasındaki yasal faiz oranı. Sözleşmede farklı bir oran varsa onu girin. Oranı mutlaka doğrulayın.'
              : 'Sözleşmedeki veya geçerli yasal faiz oranını girin. Oranı mutlaka doğrulayın.'
          }
        />
        {interest !== null && a !== null ? (
          <Result
            label="Gecikme faizi (tahmin)"
            value={formatLira(interest)}
            rows={[
              { label: 'Anapara', value: formatLira(toKurus(a)) },
              { label: 'Faiz dahil toplam', value: formatLira(toKurus(a) + interest) },
            ]}
          />
        ) : (
          <Result
            label=""
            error="Tutar, gün sayısı ve faiz oranı için geçerli (negatif olmayan) değerler girin."
          />
        )}
        <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--muted)' }}>
          Hesap: tutar × yıllık oran × gün ÷ 365 (basit faiz).
        </p>
        <ResultNotice />
      </Paper>
    </ToolPage>
  )
}
