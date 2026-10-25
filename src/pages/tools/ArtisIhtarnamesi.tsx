import { useState } from 'react'
import { DocOutput } from '../../components/DocOutput'
import { DateField, Field, Paper, TextField } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { increaseNoticeText } from '../../lib/docs/templates'
import { computeIncrease } from '../../lib/rent/increase'
import { fromKurus, parseNumber } from '../../lib/rent/money'
import { useRateChoice } from '../../lib/useRateChoice'

const today = () => new Date().toISOString().slice(0, 10)

export default function ArtisIhtarnamesi() {
  const choice = useRateChoice()
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [address, setAddress] = useState('')
  const [rent, setRent] = useState('10.000')
  const [effective, setEffective] = useState('')
  const [date, setDate] = useState(today)

  const result = computeIncrease(parseNumber(rent), choice.rate)
  const text = increaseNoticeText({
    sender,
    recipient,
    address,
    currentRent: parseNumber(rent) ?? 0,
    newRent: result.ok ? fromKurus(result.value.newRent) : 0,
    ratePercent: choice.rate ?? 0,
    effectiveDate: effective,
    date,
  })

  return (
    <ToolPage slug="artis-ihtarnamesi">
      <Paper title="BELGE BİLGİLERİ">
        <TextField id="gonderen" label="Gönderen (ad soyad)" value={sender} onChange={setSender} />
        <TextField id="alici" label="Alıcı (ad soyad)" value={recipient} onChange={setRecipient} />
        <TextField
          id="adres"
          label="Kiralanan taşınmazın adresi"
          value={address}
          onChange={setAddress}
          multiline
        />
        <Field id="kira" label="Mevcut aylık kira" value={rent} onChange={setRent} suffix="₺" />
        <Field
          id="oran"
          label="Uygulanacak artış oranı"
          value={choice.rateText}
          onChange={choice.setRateText}
          suffix="%"
          hint="Varsayılan oran veri dosyasındaki en güncel TÜFE 12 aylık ortalamadır. Sözleşme yıldönümünüze uygun oranı kontrol edin."
        />
        <DateField
          id="gecerlilik"
          label="Yeni kiranın geçerli olacağı tarih"
          value={effective}
          onChange={setEffective}
        />
        <DateField id="tarih" label="Belge tarihi" value={date} onChange={setDate} />
        <DocOutput
          title="Kira Bedeli Artışı Bildirimi"
          generated={text}
          filename="kira-artis-bildirimi"
        />
      </Paper>
    </ToolPage>
  )
}
