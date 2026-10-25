import { useState } from 'react'
import { DocOutput } from '../../components/DocOutput'
import { DateField, Field, Paper, SelectField, TextField } from '../../components/Paper'
import { ToolPage } from '../../components/ToolPage'
import { leaveNoticeText, type LeaveKind } from '../../lib/docs/templates'
import { parseNumber } from '../../lib/rent/money'

const today = () => new Date().toISOString().slice(0, 10)

export default function TahliyeVeDepozitoYazisi() {
  const [kind, setKind] = useState<LeaveKind>('tahliye')
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [address, setAddress] = useState('')
  const [date, setDate] = useState(today)
  const [moveOut, setMoveOut] = useState('')
  const [deposit, setDeposit] = useState('')
  const [iban, setIban] = useState('')

  const text = leaveNoticeText({
    kind,
    sender,
    recipient,
    address,
    date,
    moveOutDate: moveOut,
    deposit: parseNumber(deposit) ?? 0,
    iban,
  })

  return (
    <ToolPage slug="tahliye-ve-depozito-yazisi">
      <Paper title="BELGE BİLGİLERİ">
        <SelectField
          id="sablon"
          label="Şablon"
          value={kind}
          onChange={(v) => setKind(v as LeaveKind)}
          options={[
            { value: 'tahliye', label: 'Tahliye bildirimi' },
            { value: 'depozito', label: 'Depozito iade talebi' },
          ]}
        />
        <TextField id="gonderen" label="Gönderen (ad soyad)" value={sender} onChange={setSender} />
        <TextField id="alici" label="Alıcı (ad soyad)" value={recipient} onChange={setRecipient} />
        <TextField
          id="adres"
          label="Kiralanan taşınmazın adresi"
          value={address}
          onChange={setAddress}
          multiline
        />
        <DateField
          id="tahliye"
          label={kind === 'tahliye' ? 'Tahliye tarihi' : 'Teslim tarihi'}
          value={moveOut}
          onChange={setMoveOut}
        />
        {kind === 'depozito' && (
          <>
            <Field
              id="depozito"
              label="Depozito tutarı"
              value={deposit}
              onChange={setDeposit}
              suffix="₺"
            />
            <TextField id="iban" label="İade için IBAN" value={iban} onChange={setIban} />
          </>
        )}
        <DateField id="tarih" label="Belge tarihi" value={date} onChange={setDate} />
        <DocOutput
          key={kind}
          title={kind === 'tahliye' ? 'Tahliye Bildirimi' : 'Depozito İade Talebi'}
          generated={text}
          filename={kind === 'tahliye' ? 'tahliye-bildirimi' : 'depozito-iade-talebi'}
        />
      </Paper>
    </ToolPage>
  )
}
