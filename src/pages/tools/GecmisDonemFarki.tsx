import { useState } from 'react'
import { formatMonth, ResultNotice } from '../../components/Notices'
import { DateField, Field, Paper, Result, SelectField } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { useData } from '../../lib/data/DataContext'
import { backpay } from '../../lib/rent/backpay'
import { addMonths, rateForDataMonth } from '../../lib/rent/cpi'
import { formatLira, formatPercent, parseNumber } from '../../lib/rent/money'

const yearCounts = [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} kira yılı` }))

export default function GecmisDonemFarki() {
  const { tufe } = useData()
  const [base, setBase] = useState('10.000')
  const [start, setStart] = useState('2024-10')
  const [count, setCount] = useState('3')
  const [legalOverride, setLegalOverride] = useState<Record<number, string>>({})
  const [applied, setApplied] = useState<Record<number, string>>({})

  const n = Number(count)
  const years = Array.from({ length: n }, (_, i) => i)

  const legalDefault = (i: number): string => {
    if (!tufe || i === 0 || !/^\d{4}-\d{2}$/.test(start)) return ''
    const renewal = addMonths(start, 12 * i)
    const r = rateForDataMonth(tufe, addMonths(renewal, -1))
    return r ? String(r.rate).replace('.', ',') : ''
  }
  const legalText = (i: number) => legalOverride[i] ?? legalDefault(i)

  const rows = years.map((i) => ({
    legalRate: i === 0 ? 0 : (parseNumber(legalText(i)) ?? NaN),
    appliedRate: i === 0 ? 0 : (parseNumber(applied[i] ?? '0') ?? NaN),
  }))
  const result = backpay(parseNumber(base) ?? NaN, rows)

  return (
    <ToolPage slug="gecmis-donem-farki">
      <Paper title="HESAP PUSULASI">
        <Field id="baz" label="İlk yıl aylık kira" value={base} onChange={setBase} suffix="₺" />
        <DateField
          id="baslangic"
          label="Sözleşme başlangıç ayı"
          type="month"
          value={start}
          onChange={setStart}
        />
        <SelectField
          id="yil"
          label="Kaç kira yılı"
          value={count}
          onChange={setCount}
          options={yearCounts}
        />
        {years.slice(1).map((i) => (
          <fieldset
            key={i}
            style={{
              border: '1px dashed var(--line)',
              borderRadius: 6,
              margin: '0 0 16px',
              padding: 12,
            }}
          >
            <legend style={{ fontWeight: 600, padding: '0 6px' }}>
              {i + 1}. yıl
              {/^\d{4}-\d{2}$/.test(start) && ` (${formatMonth(addMonths(start, 12 * i))})`}
            </legend>
            <Field
              id={`yasal-${i}`}
              label="O yılın yasal artış oranı"
              value={legalText(i)}
              onChange={(v) => setLegalOverride((s) => ({ ...s, [i]: v }))}
              suffix="%"
              hint={
                legalOverride[i] === undefined && legalDefault(i)
                  ? 'Veri dosyasından geldi; düzenleyebilirsiniz.'
                  : 'Bu yıl için veri yoksa veya farklıysa elle girin.'
              }
            />
            <Field
              id={`uygulanan-${i}`}
              label="Fiilen uygulanan artış oranı"
              value={applied[i] ?? '0'}
              onChange={(v) => setApplied((s) => ({ ...s, [i]: v }))}
              suffix="%"
            />
          </fieldset>
        ))}
        {result ? (
          <>
            <Result
              label={
                result.total >= 0 ? 'Eksik uygulanan toplam fark' : 'Fazla uygulanan toplam fark'
              }
              value={formatLira(Math.abs(result.total))}
            />
            <table style={{ width: '100%', marginTop: 12, fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th align="left">Yıl</th>
                  <th align="right">Olması gereken</th>
                  <th align="right">Uygulanan</th>
                  <th align="right">Yıllık fark</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.year}>
                    <td>{r.year}</td>
                    <td align="right">{formatLira(r.entitledRent)}</td>
                    <td align="right">{formatLira(r.appliedRent)}</td>
                    <td align="right">{formatLira(r.yearlyDiff)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
              Oranlar:{' '}
              {result.rows.length > 1
                ? rows
                    .slice(1)
                    .map((r) => formatPercent(r.legalRate))
                    .join(', ')
                : '-'}
            </p>
          </>
        ) : (
          <Result label="" error="Kira tutarı ve tüm oranlar için geçerli değerler girin." />
        )}
        <ResultNotice />
      </Paper>
    </ToolPage>
  )
}
