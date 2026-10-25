import { useEffect, useState } from 'react'
import { DateField, Field, Paper } from '../../components/Paper'
import { ResultNotice, formatDate } from '../../components/Notices'
import { ToolPage } from '../../components/ToolPage'
import { contractEvents, type ContractEvent } from '../../lib/calendar/contract'
import { downloadBlob } from '../../lib/pdf/loadFonts'
import { parseNumber } from '../../lib/rent/money'
import styles from './Takvim.module.css'

const KEY = 'reminders-v1'

function readStored(): ContractEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ContractEvent[]) : []
  } catch {
    return []
  }
}

function writeStored(list: ContractEvent[] | null) {
  try {
    if (list === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // storage unavailable; reminders simply are not kept
  }
}

export default function SozlesmeTakvimi() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [days, setDays] = useState('30')
  const [keep, setKeep] = useState(false)
  const [saved, setSaved] = useState<ContractEvent[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readStored())
  }, [])

  const reminderDays = parseNumber(days)
  const events =
    start && reminderDays !== null
      ? contractEvents({ start, end, reminderDays: Math.round(reminderDays) })
      : null

  const onIcs = async () => {
    if (!events) return
    const { toIcs } = await import('../../lib/calendar/ics')
    const ics = toIcs(events)
    if (ics) downloadBlob(ics, 'kira-sozlesmesi.ics', 'text/calendar')
  }

  const onSave = () => {
    if (!events) return
    writeStored(events)
    setSaved(events)
  }

  const onClear = () => {
    writeStored(null)
    setSaved([])
  }

  const onExport = () =>
    downloadBlob(JSON.stringify(saved, null, 2), 'hatirlatmalar.json', 'application/json')

  return (
    <ToolPage slug="sozlesme-takvimi">
      <Paper title="SÖZLEŞME TARİHLERİ">
        <DateField
          id="baslangic"
          label="Sözleşme başlangıç tarihi"
          value={start}
          onChange={setStart}
        />
        <DateField
          id="bitis"
          label="Sözleşme bitiş tarihi (isteğe bağlı)"
          value={end}
          onChange={setEnd}
        />
        <Field
          id="gun"
          label="Artış bildirimi hatırlatması: yıldönümünden kaç gün önce"
          value={days}
          onChange={setDays}
          suffix="gün"
          inputMode="numeric"
          hint="Bu bir kolaylık hatırlatmasıdır; hukuki bir süre değildir."
        />
        <div aria-live="polite">
          {start && !events && (
            <p className={styles.error}>
              Geçerli tarihler girin; bitiş tarihi başlangıçtan sonra olmalıdır.
            </p>
          )}
          {events && (
            <ol className={styles.list}>
              {events.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.date}>{formatDate(e.date)}</time>
                  <span>{e.title}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onIcs} disabled={!events}>
            Takvim dosyası indir (.ics)
          </button>
        </div>
        <fieldset className={styles.local}>
          <legend>Bu cihazda hatırlatma listesi</legend>
          <label className={styles.check}>
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            <span>
              Tarihleri yalnızca bu tarayıcıda saklamak istiyorum. Hiçbir sunucuya gönderilmez;
              istediğiniz zaman silebilir veya dışa aktarabilirsiniz.
            </span>
          </label>
          {keep && (
            <div className={styles.actions}>
              <button type="button" onClick={onSave} disabled={!events}>
                Listeyi bu cihaza kaydet
              </button>
            </div>
          )}
          {saved.length > 0 && (
            <>
              <ul className={styles.list}>
                {saved.map((e) => (
                  <li key={e.id}>
                    <time dateTime={e.date}>{formatDate(e.date)}</time>
                    <span>{e.title}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.actions}>
                <button type="button" onClick={onExport}>
                  Dışa aktar (.json)
                </button>
                <button type="button" onClick={onClear}>
                  Kayıtlı listeyi sil
                </button>
              </div>
            </>
          )}
        </fieldset>
        <ResultNotice />
      </Paper>
    </ToolPage>
  )
}
