# Kira Cetveli

Kira artışını doğru hesaplamak ve kira konusundaki günlük işleri (gecikme faizi, depozito, vergi tahmini, hazır belgeler, sözleşme takvimi, rehberler) kolaylaştırmak için hazırlanmış, sunucusuz bir web sitesi. Her şey tarayıcıda çalışır; yalnızca küçük bir statik veri dosyası (TÜFE endeksi) periyodik olarak güncellenir.

> Bu bir **hesaplama ve taslak aracıdır, hukuki danışmanlık değildir.** Her sonuç ekranında ve her belgede bu uyarı ile verinin son güncelleme tarihi gösterilir.

## Özellikler

- Kira artış hesabı: sözleşme yenileme ayı seçilince o aya ait TÜFE 12 aylık ortalama otomatik gelir; son 12 ayın tamamı tabloda listelenir.
- Gecikme faizi, geçmiş dönem farkı, depozito iadesi, stopaj ve gelir vergisi tahmini.
- Belgeler: kira artış bildirimi, tahliye bildirimi, depozito iade talebi (PDF ve düzenlenebilir metin).
- Sözleşme takvimi (.ics) ve isteğe bağlı, yalnızca bu cihazda tutulan hatırlatma listesi; sözleşme kontrol listesi.
- Rehberler (kiracı hakları, ev sahibi yükümlülükleri) ve sık sorulan sorular.
- Çevrimdışı çalışan PWA, aydınlık/karanlık tema, her sayfa için statik HTML.

## Kurulum ve geliştirme

Gereksinim: Node.js 22 veya üzeri (uygulama Node 20'de de derlenir; Cloudflare dağıtım aracı Wrangler Node 22 ister).

```
npm install
npx playwright install chromium   # yalnızca uçtan uca testler için
npm run dev
```

Komutlar:

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Tip denetimi, statik HTML üretimi, `robots.txt`, `sitemap.xml`, `404.html` |
| `npm run preview` | Üretim derlemesini yerelde sun |
| `npm test` | Birim testleri (Vitest) |
| `npm run test:e2e` | Uçtan uca testler (Playwright; derleyip çalıştırır) |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run data:update` | EVDS'den TÜFE endeksini çeker ve doğrular |
| `npm run data:validate` | Veri dosyalarını doğrular |

Dizin yapısı: `src/lib/rent` saf hesap fonksiyonları (arayüzden bağımsız), `src/lib/data` veri şemaları, `src/lib/docs` ve `src/lib/pdf` belge üretimi, `src/pages` sayfalar, `public/data` yasal değerler.

## Veri ve mevzuat

Hiçbir yasal değer koda gömülü değildir; hepsi `public/data/` altındaki, zod şemasıyla doğrulanan dosyalardadır:

- `tufe.json`: aylık TÜFE endeksi (`endeks`), TÜİK'in açıkladığı 12 aylık ortalama değişim (`ortalamaDegisim`), son güncelleme, kaynak. Anahtar, verinin ait olduğu aydır; kira yenileme ayı bir sonraki aydır (örneğin Eylül verisi Ekim yenilemesi için geçerlidir).
- `yasal-oranlar.json`: yasal faiz zaman çizelgesi, kira geliri istisnası, gelir vergisi tarifesi, götürü gider oranı, stopaj. Her satırda kaynak, doğrulama tarihi ve `dogrulanmali` işareti vardır.

**Oran formülü (TBK madde 344):** `(son 12 ayın endeks ortalaması / bir önceki 12 ayın ortalaması − 1) × 100`, 2 ondalığa yuvarlanır. Endeks serisi varsa oran bundan hesaplanır ve TÜİK'in açıkladığı değerle çapraz kontrol edilir; fark 0,02 puandan büyükse `npm run data:validate` hata verir ve güncelleme dosyaya yazılmaz. Seride olmayan bir ay için açıklanan değer, o da yoksa hesaplanan değer kullanılır.

Konut kiralarındaki geçici %25 üst sınır uygulaması sona ermiştir; bugünkü yaklaşım TBK 344'e göre TÜFE 12 aylık ortalamadır. **Bu bilgi yayına çıkmadan önce Resmî Gazete ve TÜİK'ten bir kez daha doğrulanmalıdır.**

Uygulama çalışma zamanında EVDS'ye veya başka bir dış servise istek atmaz; yalnızca kendi alan adından `data/*.json` okur. Veri dosyalarının derleme anındaki hali sayfaya gömülür (sayfalar tam dolu üretilir), canlı dosya ise yüklendikten sonra okunur. Veri 45 günden eskiyse sonuç ekranlarında uyarı çıkar.

### Aylık otomatik güncelleme

`.github/workflows/data-update.yml`, her ayın 3-10'u arasında günlük çalışır (TÜİK açıklaması bu aralığa düşer), EVDS'den endeksi çeker, doğrular ve değişiklik varsa `chore(data): update CPI index` başlıklı bir PR açar. PR hiçbir zaman otomatik birleştirilmez; insan onayı gerekir. Birleşince (`main`'e push) deploy iş akışı testleri çalıştırıp siteyi Cloudflare'de yeniler. `EVDS_API_KEY` tanımlı değilse zamanlanmış iş sessizce atlanır. Yeni ayın oranı endeksten hesaplanır, kullanıcıya hem ay ay seçenek (yenileme ayı) hem son 12 ayın tablosu olarak sunulur.

Kurulum:

1. [EVDS](https://evds3.tcmb.gov.tr)'e üye olun, giriş yapıp profil sayfanızdan **API anahtarı** üretin.
2. GitHub deposunda Settings, Secrets and variables, Actions bölümüne `EVDS_API_KEY` adıyla ekleyin. Anahtarı depoya veya `.env` dışındaki herhangi bir dosyaya yazmayın (`.env` `.gitignore`'dadır).
3. Settings, Actions, General bölümünde "Allow GitHub Actions to create and approve pull requests" seçeneğini açın.
4. Deploy için `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` secret'larını da ekleyin.
5. Yerelde denemek için: `EVDS_API_KEY=... npm run data:update -- --dry-run` (dosyaya yazmaz).

Betik şunları reddeder: negatif/geçersiz değer, eksik ay, aylık %15'ten büyük sıçrama (ör. zincirlenmemiş baz yılı değişikliği), açıklanan oranla çelişen hesap. Anahtar yoksa betik "elle güncelleme" kipini anlatıp çıkar: `public/data/tufe.json` dosyasını düzenleyip `npm run data:validate` çalıştırın.

> **EVDS ayrıntıları gerçek anahtarla doğrulandı (25 Ekim 2026).** Uç nokta `https://evds3.tcmb.gov.tr/igmevdsms-dis`, parametrelerin yola `&` ile eklenmesi, tarih biçimi (GG-AA-YYYY) ve anahtarın `key` başlığıyla iletilmesi çalışıyor. Eski `TP.FG.J0` serisi (2003=100) Ocak 2026'da bitiyor; TÜİK'in yeni baz yılı (2025=100) serisi `TP.TUKFIY2025.GENEL` (veri grubu `bie_tukfiy2025`) 2005'ten itibaren tek, tutarlı bir seri sunuyor ve varsayılan olarak o kullanılıyor. `tufe.json` hangi seriden geldiğini `seri` alanında tutar; seri değişirse betik eski endeksi birleştirmez, tamamen değiştirir (farklı baz yılları karışırsa oranlar bozulur). Başka bir seri için `EVDS_BASE` ve `EVDS_SERIES` ortam değişkenleri kullanılabilir. EVDS kullanım şartları gereği veriler kaynak gösterilerek kullanılır (siteye eklenmiştir).

## Gizlilik

Girdiğiniz kira, ad, adres vb. bilgiler hiçbir sunucuya gönderilmez; PDF ve takvim dosyaları cihazda üretilir. Üçüncü taraf analitik, çerez veya Google Fonts isteği yoktur (yazı tipleri `public/fonts` altında self-host). Tarayıcıda yalnızca tema tercihi ve, açık izinle, takvim hatırlatma listesi saklanır; ikincisi silinebilir ve dışa aktarılabilir. Uçtan uca testler ağ isteklerini izleyerek bunu doğrular.

## Dağıtım (Cloudflare)

Site Cloudflare'de (Workers statik varlıkları) `kira.beraekimci.com.tr` adresinde yayınlanır. Yapılandırma `wrangler.jsonc` dosyasındadır; alan adı `routes` içinde `custom_domain` olarak tanımlıdır (DNS kaydı ve sertifika dağıtım sırasında otomatik oluşur).

- Elle yayın: `VITE_SITE_URL=https://kira.beraekimci.com.tr npm run deploy` (ortamda `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` bulunmalı).
- Otomatik yayın: `.github/workflows/deploy.yml`, `main`'e her push'ta lint, veri doğrulama, birim ve uçtan uca testleri çalıştırır, derler ve yayınlar. Repo secret'ları: `CLOUDFLARE_API_TOKEN` (Workers yazma izni), `CLOUDFLARE_ACCOUNT_ID`.
- `VITE_SITE_URL`: `sitemap.xml` ve canonical bağlantılar için mutlak adres. Tanımlı değilse sitemap üretilmez.
- `public/_headers`: `no-transform` ile Cloudflare'in sayfaya betik eklemesini (ör. Web Analytics işaretçisi) engeller; içerik güvenlik politikası (CSP) yalnızca kendi alan adından kaynak yüklenmesine izin verir. Gizlilik beyanının dayanağıdır.
- Başka bir alt alan adı için `wrangler.jsonc` içindeki `pattern` değerini değiştirin.

## Başka bir statik barındırma kullanmak

`dist/` klasörü düz statik dosyalardır. GitHub Pages gibi alt dizin barındırmada `VITE_BASE` (ör. `/Kira-Cetveli/`) ayarlanır; `404.html` bilinmeyen adresler için hazırdır. `public/CNAME.example` dosyası GitHub Pages özel alan adı için yer tutucudur.

## Kararlar

- **React 18 ve react-router-dom 6:** `vite-react-ssg` react-router 6 gerektirir, görev tanımı React 18 istiyordu; Vite şablonunun React 19'u geri çekildi.
- **Statik HTML için `vite-react-ssg`:** her rota prerender edilir. Bilinmeyen adresler için GitHub Pages `404.html` sunar; bu dosya boş kökle uygulama kabuğudur ve router "Sayfa bulunamadı" sayfasını çizer. PWA da bu kabuğu sayfa yedeği olarak kullanır.
- **Veri gömme:** derleme anındaki veri dosyaları başlangıç durumu olarak paketlenir; böylece sayfalar içeriğiyle prerender edilir (SEO) ve veri yüklenirken yerleşim kaymaz (CLS 0). Canlı dosya yine de yüklenip önceliklidir.
- **Oran önceliği:** açıklanan TÜİK değeri, yoksa endeksten hesaplanan değer. Çapraz kontrol toleransı 0,02 puan.
- **PDF yazı tipi:** `pdf-lib` + `@pdf-lib/fontkit`, self-host woff2 (latin ve latin-ext alt kümeleri) ile; Ğ ğ Ş ş İ karakterleri ext alt kümesinden çizilir. fontkit'in woff2 alt kümeleme kodlayıcısı hata verdiği için gömme tam yazı tipiyle (alt kümesiz) yapılır; PDF kodu yalnızca kullanılınca yüklenir (ayrı parça).
- **Depozito faizi, gecikme faizi:** basit faiz, gün/365. Depozito faiz oranı için hazır veri yoktur, kullanıcı girer.
- **Veri dosyaları doğrulama durumu:** `dogrulanmamis`/`dogrulanmali` işaretleri arayüzde görünür; 2026 vergi istisnası ve tarifesi için veri yoktur (araç uyarı verir, elle giriş gerekir).
- **Vitest 5 + tsx:** betikler TypeScript ve uygulamanın şema/hesap kodunu paylaşır.
- **Branch:** çalışma `main` üzerinde yürür.
- Bölge kira karşılaştırma "Yakında" olarak bırakıldı; veri kaynağı bağlanmadan çalışıyormuş gibi yapılmaz.
- Alt dizinde yayın için `VITE_BASE` ortam değişkeni kullanılır; PWA manifest `start_url` ve `scope` bu değere göre ayarlanır.

## Yapılacaklar (hukuki inceleme ve doğrulama gerektirenler)

- [x] `tufe.json` içindeki 13 açıklanan oran (Eylül 2025 - Eylül 2026) gerçek EVDS endeksinden hesaplanan değerle 0,02 puan içinde örtüştü. İsterseniz TÜİK bülteniyle ayrıca karşılaştırın.
- [x] EVDS uç noktası, başlık, tarih biçimi ve yeni seri kodu gerçek anahtarla doğrulandı.
- [ ] `yasal-oranlar.json`: yasal faiz oranı (24, 1 Haziran 2024), 2024/2025 kira istisnası (33.000 / 47.000), 2024/2025 gelir vergisi tarifesi, götürü gider oranı (%15), stopaj oranları hafızadan girilmiştir; Resmî Gazete ve GİB'den doğrulayın. 2026 istisna tutarı ve tarifesi eksik.
- [ ] Konut kira artışında %25 üst sınırın sona erdiği bilgisini Resmî Gazete / TÜİK ile yayından önce bir kez daha doğrulayın.
- [ ] Rehber sayfaları ve atıf yapılan TBK maddeleri (315, 342, 344, 347, 350, 351) bir hukukçu tarafından gözden geçirilmeli; kira bedelinin ödenmesi, tahliye taahhüdü ve ödeme ihtarı süreleri gibi konular eklenmeden önce incelenmeli.
- [ ] Belge şablonlarının (artış bildirimi, tahliye, depozito talebi) dili hukuki incelemeden geçmeli.
- [ ] Sözleşme kontrol listesi ve gizlilik sayfası hukuki incelemeden geçmeli (gizlilik sayfası KVKK aydınlatma metni yerine geçmez).
- [ ] Bölge kira karşılaştırma için kullanım koşulları uygun bir veri kaynağı bulunmalı.
- [ ] Gerçek bir alan adı ve `VITE_SITE_URL` ile yayına çıkın, sonra sitemap'i Search Console'a gönderin.
