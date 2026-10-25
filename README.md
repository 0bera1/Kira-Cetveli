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

Gereksinim: Node.js 20 veya üzeri.

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

`.github/workflows/data-update.yml`, her ayın 3-10'u arasında günlük çalışır (TÜİK açıklaması bu aralığa düşer), EVDS'den endeksi çeker, doğrular ve değişiklik varsa `chore(data): update CPI index` başlıklı bir PR açar. PR hiçbir zaman otomatik birleştirilmez; insan onayı gerekir. Birleşince deploy iş akışı siteyi yeniler. Yeni ayın oranı endeksten hesaplanır, kullanıcıya hem ay ay seçenek (yenileme ayı) hem son 12 ayın tablosu olarak sunulur.

Kurulum:

1. [EVDS](https://evds3.tcmb.gov.tr)'e üye olun, giriş yapıp profil sayfanızdan **API anahtarı** üretin.
2. GitHub deposunda Settings, Secrets and variables, Actions bölümüne `EVDS_API_KEY` adıyla ekleyin. Anahtarı depoya veya `.env` dışındaki herhangi bir dosyaya yazmayın (`.env` `.gitignore`'dadır).
3. Settings, Actions, General bölümünde "Allow GitHub Actions to create and approve pull requests" seçeneğini açın.
4. Yerelde denemek için: `EVDS_API_KEY=... npm run data:update -- --dry-run` (dosyaya yazmaz).

Betik şunları reddeder: negatif/geçersiz değer, eksik ay, aylık %15'ten büyük sıçrama (ör. zincirlenmemiş baz yılı değişikliği), açıklanan oranla çelişen hesap. Anahtar yoksa betik "elle güncelleme" kipini anlatıp çıkar: `public/data/tufe.json` dosyasını düzenleyip `npm run data:validate` çalıştırın.

> **EVDS ayrıntıları doğrulanmadı.** Uç nokta (`evds3.tcmb.gov.tr/igmevdsms-dis`), parametrelerin yola `&` ile eklenmesi, tarih biçimi (GG-AA-YYYY), anahtarın `key` başlığıyla iletilmesi ve seri kodu `TP.FG.J0` resmî kılavuzdan değil, ikincil kaynaklardan (bakımı yapılan istemci kütüphaneleri ve TCMB duyurusu) alınmıştır; resmî kılavuz bu çalışma sırasında okunamadı. Gerçek anahtarla ilk çalıştırmada bunların doğru olduğunu ve TÜİK baz yılı değişikliğinden sonra `TP.FG.J0` serisinin hâlâ genel TÜFE endeksi olduğunu teyit edin. Gerekirse `EVDS_BASE` ve `EVDS_SERIES` ortam değişkenleriyle düzeltebilirsiniz. EVDS kullanım şartları gereği veriler kaynak gösterilerek kullanılır (siteye eklenmiştir).

## Gizlilik

Girdiğiniz kira, ad, adres vb. bilgiler hiçbir sunucuya gönderilmez; PDF ve takvim dosyaları cihazda üretilir. Üçüncü taraf analitik, çerez veya Google Fonts isteği yoktur (yazı tipleri `public/fonts` altında self-host). Tarayıcıda yalnızca tema tercihi ve, açık izinle, takvim hatırlatma listesi saklanır; ikincisi silinebilir ve dışa aktarılabilir. Uçtan uca testler ağ isteklerini izleyerek bunu doğrular.

## Dağıtım (GitHub Pages)

`.github/workflows/deploy.yml`: `main`'e her push'ta lint, veri doğrulama, birim ve uçtan uca testleri çalıştırır, derler ve Pages'e dağıtır. Depoda Settings, Pages, Source: **GitHub Actions** seçin.

- `VITE_BASE`: alt dizinde yayınlıyorsanız (ör. `/Kira-Cetveli/`) Settings, Variables bölümüne ekleyin; özel alan adında `/` bırakın.
- `VITE_SITE_URL`: `sitemap.xml` ve canonical bağlantılar için mutlak adres (ör. `https://ornek.com`). Tanımlı değilse sitemap üretilmez.

### Özel alan adı (Cloudflare)

1. `public/CNAME.example` dosyasını `public/CNAME` olarak yeniden adlandırın ve içine yalnızca alan adını yazın. (Alan adı bu README'de bilerek boş bırakılmıştır.)
2. Cloudflare panelinde alan adını seçin, DNS, Add record: Type **CNAME**, Name alt alan adı (kök için `@`), Target `<kullanıcı-adı>.github.io`. Önce Proxy durumunu "DNS only" yapın, GitHub sertifikayı üretene kadar bekleyin.
3. GitHub, Settings, Pages, Custom domain alanına alan adını yazın; "Enforce HTTPS"i açın.
4. `VITE_BASE=/` ve `VITE_SITE_URL=https://<alan-adı>` değişkenlerini ayarlayıp yeniden dağıtın.
5. İsterseniz sertifika oluştuktan sonra Cloudflare proxy'yi açın (SSL/TLS modu **Full** olmalı).

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

- [ ] `tufe.json` içindeki `ortalamaDegisim` değerlerini (Eylül 2025 - Eylül 2026) TÜİK açıklamalarıyla karşılaştırıp işaretini kaldırın. Şu an basın ve hukuk sitelerinden alınmış, **teyit edilmemiş örnektir** (Ekim 2026 yenilemesi için %31,49 dahil).
- [ ] EVDS anahtarıyla ilk çalıştırmada uç nokta, başlık, tarih biçimi ve `TP.FG.J0` seri kodunu doğrulayın (yukarıdaki not).
- [ ] `yasal-oranlar.json`: yasal faiz oranı (24, 1 Haziran 2024), 2024/2025 kira istisnası (33.000 / 47.000), 2024/2025 gelir vergisi tarifesi, götürü gider oranı (%15), stopaj oranları hafızadan girilmiştir; Resmî Gazete ve GİB'den doğrulayın. 2026 istisna tutarı ve tarifesi eksik.
- [ ] Konut kira artışında %25 üst sınırın sona erdiği bilgisini Resmî Gazete / TÜİK ile yayından önce bir kez daha doğrulayın.
- [ ] Rehber sayfaları ve atıf yapılan TBK maddeleri (315, 342, 344, 347, 350, 351) bir hukukçu tarafından gözden geçirilmeli; kira bedelinin ödenmesi, tahliye taahhüdü ve ödeme ihtarı süreleri gibi konular eklenmeden önce incelenmeli.
- [ ] Belge şablonlarının (artış bildirimi, tahliye, depozito talebi) dili hukuki incelemeden geçmeli.
- [ ] Sözleşme kontrol listesi ve gizlilik sayfası hukuki incelemeden geçmeli (gizlilik sayfası KVKK aydınlatma metni yerine geçmez).
- [ ] Bölge kira karşılaştırma için kullanım koşulları uygun bir veri kaynağı bulunmalı.
- [ ] Gerçek bir alan adı ve `VITE_SITE_URL` ile yayına çıkın, sonra sitemap'i Search Console'a gönderin.
