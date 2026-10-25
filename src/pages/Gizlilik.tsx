import { Seo } from '../components/Seo'
import styles from './Prose.module.css'

export default function Gizlilik() {
  return (
    <article className={styles.prose}>
      <Seo
        title="Gizlilik"
        description="Girdiğiniz rakamlar cihazınızdan çıkmaz. Kira Cetveli çerez, izleyici veya üçüncü taraf analitik kullanmaz."
        path="/gizlilik"
      />
      <h1>Gizlilik</h1>
      <p className={styles.lead}>Girdiğiniz rakamlar cihazınızdan çıkmaz.</p>
      <h2>Ne yapıyoruz</h2>
      <ul>
        <li>Kira tutarı, ad, adres ve diğer tüm girdiler yalnızca tarayıcınızda işlenir.</li>
        <li>
          Hiçbir sunucuya kişisel veri gönderilmez. Uygulama yalnızca kendi alan adından statik
          dosyaları (sayfalar, yazı tipleri ve oran verisi) okur.
        </li>
        <li>PDF belgeleri ve takvim dosyaları cihazınızda oluşturulur.</li>
        <li>
          Çerez, izleyici veya üçüncü taraf analitik kullanılmaz; Google Fonts&apos;a istek atılmaz.
        </li>
      </ul>
      <h2>Tarayıcıda ne saklanır</h2>
      <ul>
        <li>
          <strong>Tema tercihi:</strong> aydınlık veya karanlık seçiminiz.
        </li>
        <li>
          <strong>Hatırlatma listesi:</strong> yalnızca Sözleşme takvimi sayfasında açıkça izin
          verirseniz. Aynı sayfadan silebilir veya dışa aktarabilirsiniz.
        </li>
        <li>Tarayıcı verilerini silerek her şeyi temizleyebilirsiniz.</li>
      </ul>
      <h2>Nasıl doğruladık</h2>
      <p>
        Otomatik uçtan uca testlerimiz, belge oluştururken ağ isteklerini izler ve girdilerin hiçbir
        isteğe eklenmediğini, kendi alan adı dışında istek yapılmadığını denetler.
      </p>
      <p className={styles.note}>
        Bu sayfa teknik bir açıklamadır; hukuki bir aydınlatma metni yerine geçmez. Bu bölüm hukuki
        incelemeden geçmelidir.
      </p>
    </article>
  )
}
