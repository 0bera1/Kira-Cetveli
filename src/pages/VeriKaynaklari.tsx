import { Link } from 'react-router-dom'
import { formatDate, ResultNotice } from '../components/Notices'
import { RateTable } from '../components/RateTable'
import { Seo } from '../components/Seo'
import { useData } from '../lib/data/DataContext'
import { rateOptions } from '../lib/rent/cpi'
import { formatPercent } from '../lib/rent/money'
import styles from './Prose.module.css'

export default function VeriKaynaklari() {
  const { tufe, yasal } = useData()
  const options = tufe ? rateOptions(tufe, 12) : []
  return (
    <article className={styles.prose}>
      <Seo
        title="Veri kaynakları"
        description="Kira Cetveli'nin kullandığı TÜFE, faiz ve vergi verilerinin kaynakları, güncelleme tarihleri ve doğrulama durumu."
        path="/veri-kaynaklari"
      />
      <h1>Veri kaynakları</h1>
      <p className={styles.lead}>
        Hesaplarda kullanılan tüm yasal değerler kodda değil, sitenin kendi sunucusundan okunan veri
        dosyalarındadır. Uygulama çalışırken başka hiçbir dış servise istek atmaz.
      </p>

      <h2>Kira artış oranı (TÜFE 12 aylık ortalama)</h2>
      <p>
        Oran, son 12 ayın TÜFE endeks ortalamasının bir önceki 12 ayın ortalamasına göre
        değişimidir. Yenileme ayında esas alınan değer, bir önceki ayın TÜİK verisidir. TEFE artık
        yayımlanmadığı için hesaplamada yalnızca TÜFE kullanılır.
      </p>
      {tufe && (
        <p>
          Kaynak: <a href={tufe.kaynak.url}>{tufe.kaynak.ad}</a>. Son güncelleme:{' '}
          {formatDate(tufe.guncelleme)}.
        </p>
      )}
      {tufe?.dogrulanmamis && (
        <p className={styles.note}>
          Şu an yüklü oranlar teyit edilmemiş örnek veridir ve resmî TÜİK açıklamasıyla
          değiştirilecektir. {tufe.not}
        </p>
      )}
      <RateTable options={options} />
      <p>
        Endeks verisi TCMB Elektronik Veri Dağıtım Sistemi (EVDS) üzerinden alınır; veriler kaynak
        gösterilerek kullanılır. TCMB yalnızca veri sağlayıcısıdır; hesaplama ve yorumlar bu siteye
        aittir.
      </p>

      <h2>Yasal faiz, vergi ve istisna değerleri</h2>
      {yasal ? (
        <>
          <p>Son güncelleme: {formatDate(yasal.guncelleme)}.</p>
          <table className={styles.table}>
            <caption className="visually-hidden">Yasal faiz oranı zaman çizelgesi</caption>
            <thead>
              <tr>
                <th scope="col">Başlangıç</th>
                <th scope="col">Bitiş</th>
                <th scope="col">Yıllık oran</th>
                <th scope="col">Durum</th>
              </tr>
            </thead>
            <tbody>
              {yasal.yasalFaiz.map((r) => (
                <tr key={r.baslangic}>
                  <td>{formatDate(r.baslangic)}</td>
                  <td>{r.bitis ? formatDate(r.bitis) : 'Devam ediyor'}</td>
                  <td>{formatPercent(r.oran)}</td>
                  <td className={r.dogrulanmali ? styles.flag : undefined}>
                    {r.dogrulanmali ? 'Doğrulanmalı' : 'Doğrulandı'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className={styles.table}>
            <caption className="visually-hidden">Kira geliri istisnası</caption>
            <thead>
              <tr>
                <th scope="col">Yıl</th>
                <th scope="col">İstisna tutarı</th>
                <th scope="col">Durum</th>
              </tr>
            </thead>
            <tbody>
              {yasal.kiraIstisnasi.map((r) => (
                <tr key={r.yil}>
                  <td>{r.yil}</td>
                  <td>
                    {r.tutar === null
                      ? 'Veri yok'
                      : `₺${new Intl.NumberFormat('tr-TR').format(r.tutar)}`}
                  </td>
                  <td className={r.dogrulanmali ? styles.flag : undefined}>
                    {r.dogrulanmali ? 'Doğrulanmalı' : 'Doğrulandı'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {yasal.not && <p className={styles.note}>{yasal.not}</p>}
        </>
      ) : (
        <p>Veri dosyası yüklenemedi.</p>
      )}

      <h2>Güncelleme süreci</h2>
      <p>
        Veri dosyaları, depodaki zamanlanmış bir iş akışıyla her ay güncellenir ve değişiklikler bir
        insan onayından geçtikten sonra yayına alınır. Veri 45 günden eskiyse sonuç ekranlarında
        uyarı gösterilir. Ayrıntılar için <Link to="/hakkinda">Hakkında</Link> sayfasına bakın.
      </p>
      <ResultNotice />
    </article>
  )
}
