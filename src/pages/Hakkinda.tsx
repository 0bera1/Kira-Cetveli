import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import styles from './Prose.module.css'

export default function Hakkinda() {
  return (
    <article className={styles.prose}>
      <Seo
        title="Hakkında"
        description="Kira Cetveli, kira artışı ve ilgili hesaplar için sunucusuz, ücretsiz bir araç setidir. Hukuki danışmanlık değildir."
        path="/hakkinda"
      />
      <h1>Hakkında</h1>
      <p className={styles.lead}>
        Kira Cetveli, kiracıların ve ev sahiplerinin kira konusundaki hesaplarını ve belgelerini
        tarayıcıda yapabilmesi için hazırlanmış bir araç setidir.
      </p>
      <h2>Ne sunar</h2>
      <p>
        Kira artışı, gecikme faizi, depozito, geçmiş dönem farkı ve vergi tahmini hesaplayıcıları;
        yazılı bildirim ve tahliye/depozito yazıları için taslak belgeler; sözleşme takvimi ve
        kontrol listesi; kısa rehberler. Tümüne <Link to="/araclar">Araçlar</Link> sayfasından
        ulaşabilirsiniz.
      </p>
      <h2>Sınırlar</h2>
      <ul>
        <li>Bu bir hesaplama ve taslak aracıdır, hukuki danışmanlık değildir.</li>
        <li>
          Sonuçlar tahmindir; kesin tutar için resmî kaynaklar ve gerekirse bir avukat esas
          alınmalıdır.
        </li>
        <li>
          Yasal değerlerin kaynağı ve doğrulama durumu{' '}
          <Link to="/veri-kaynaklari">Veri kaynakları</Link> sayfasında açıkça belirtilir.
        </li>
      </ul>
      <h2>Veri her ay nasıl güncellenir</h2>
      <p>
        Zamanlanmış bir iş akışı her ay TCMB EVDS&apos;den TÜFE endeksini çeker, değerleri doğrular
        ve değişiklik varsa bir değişiklik önerisi açar. Öneri bir insan tarafından onaylanmadan
        yayına alınmaz. Sizin cihazınız ise yalnızca hazır veri dosyasını okur.
      </p>
      <h2>Gizlilik</h2>
      <p>
        Girdiğiniz rakamlar cihazınızdan çıkmaz. Ayrıntılar için{' '}
        <Link to="/gizlilik">Gizlilik</Link> sayfasına bakın.
      </p>
    </article>
  )
}
