import { useState } from 'react'
import { ResultNotice } from '../../components/Notices'
import { DateField, Field, Paper, Result } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { depositRefund } from '../../lib/rent/interest'
import { formatLira, parseNumber } from '../../lib/rent/money'

function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function DepozitoIadesi() {
  const [amount, setAmount] = useState('20.000')
  const [paid, setPaid] = useState('2024-01-01')
  const [refund, setRefund] = useState(() => new Date().toISOString().slice(0, 10))
  const [rate, setRate] = useState('')

  const a = parseNumber(amount)
  const r = parseNumber(rate)
  const p = parseDate(paid)
  const f = parseDate(refund)
  const result = a !== null && r !== null && p && f ? depositRefund(a, p, f, r) : null

  return (
    <ToolPage slug="depozito-iadesi">
      <Paper title="HESAP PUSULASI">
        <Field
          id="depozito"
          label="Depozito tutarı"
          value={amount}
          onChange={setAmount}
          suffix="₺"
        />
        <DateField id="yatirilan" label="Yatırıldığı tarih" value={paid} onChange={setPaid} />
        <DateField id="iade" label="İade tarihi" value={refund} onChange={setRefund} />
        <Field
          id="faiz"
          label="Yıllık faiz oranı"
          value={rate}
          onChange={setRate}
          suffix="%"
          hint="Depozitonun yatırıldığı vadeli hesabın faiz oranını girin. Bu oran için hazır veri yoktur; hesap sözleşmenizden veya bankadan doğrulayın."
        />
        {result ? (
          <Result
            label="İade edilecek toplam (tahmin)"
            value={formatLira(result.total)}
            rows={[
              { label: 'Depozito', value: formatLira(result.principal) },
              { label: 'Faiz', value: formatLira(result.interest) },
              { label: 'Gün sayısı', value: String(result.days) },
            ]}
          />
        ) : (
          <Result
            label=""
            error="Tutar, faiz oranı ve tarihleri girin; iade tarihi yatırma tarihinden önce olamaz."
          />
        )}
        <ResultNotice />
      </Paper>
    </ToolPage>
  )
}
