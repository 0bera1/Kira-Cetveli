export interface GuideSection {
  heading: string
  paragraphs: string[]
  /** Statute references shown under the section. */
  refs?: string[]
}

export interface Guide {
  slug: string
  title: string
  intro: string
  sections: GuideSection[]
  faq: { q: string; a: string }[]
}

export const REVIEW_NOTE =
  'Bu bölüm hukuki incelemeden geçmelidir. Maddeler ve içerik, yayından önce güncel mevzuat ve Yargıtay uygulamasıyla doğrulanmalıdır.'

export const guides: Guide[] = [
  {
    slug: 'kiraci-haklari',
    title: 'Kiracı hakları',
    intro:
      'Konut ve çatılı iş yeri kiralarında kiracıyı koruyan başlıca kurallar. Ayrıntılar somut olaya göre değişir; bu sayfa genel bilgidir.',
    sections: [
      {
        heading: 'Kira artışının üst sınırı',
        paragraphs: [
          'Yenilenen kira dönemi için kira bedeli, bir önceki kira yılındaki TÜFE 12 aylık ortalama değişim oranını aşamaz. Sözleşmede daha yüksek bir oran yazsa bile bu sınır uygulanır.',
          'Güncel oranı Kira Cetveli üzerinde ay ay görebilirsiniz; oran verisinin kaynağı ve güncelleme tarihi Veri kaynakları sayfasında yer alır.',
        ],
        refs: ['Türk Borçlar Kanunu madde 344'],
      },
      {
        heading: 'Depozito (güvence)',
        paragraphs: [
          'Kiraya verenin isteyebileceği güvence tutarı en çok üç aylık kira bedelidir. Para, vadeli bir hesapta tutulur ve kira sona erdiğinde işleyen faiziyle birlikte iade edilir.',
        ],
        refs: ['Türk Borçlar Kanunu madde 342'],
      },
      {
        heading: 'Sözleşmenin uzaması',
        paragraphs: [
          'Belirli süreli konut ve çatılı iş yeri kiralarında, kiracı sürenin bitiminden en az on beş gün önce sona erdirme bildiriminde bulunmazsa sözleşme aynı koşullarla bir yıl uzar.',
        ],
        refs: ['Türk Borçlar Kanunu madde 347'],
      },
      {
        heading: 'Tahliye koşulları',
        paragraphs: [
          'Kiraya veren, sözleşmeyi yalnızca kanunda sayılan hallerde sona erdirebilir; örneğin kendisi veya yakınları için konut ihtiyacı ya da yeni malik olunması. Bu durumlarda süre ve usul kurallarına uyulması gerekir.',
          'İmzalamadan önce, tahliye taahhüdü gibi ek belgeleri dikkatle okuyun; anlamadığınız bir belgeyi imzalamayın.',
        ],
        refs: ['Türk Borçlar Kanunu madde 350 ve 351'],
      },
      {
        heading: 'Kira borcunun ödenmemesi',
        paragraphs: [
          'Kira bedeli ödenmezse kiraya veren yazılı bir ödeme ihtarı gönderebilir; ihtarda kiracıya ödeme için verilmesi gereken süre kanunda belirlenmiştir. Süre içinde ödeme yapılmazsa sözleşme feshedilebilir.',
        ],
        refs: ['Türk Borçlar Kanunu madde 315'],
      },
    ],
    faq: [
      {
        q: 'Ev sahibi sözleşmede yazan oranı isteyebilir mi?',
        a: 'Hayır. Sözleşmede daha yüksek bir oran yazsa bile yenilenen dönemde TÜFE 12 aylık ortalama sınırı aşılamaz. Kesin durum için bir avukata danışın.',
      },
      {
        q: 'Depozito iadesinde faiz alabilir miyim?',
        a: 'Depozito vadeli hesapta tutulur ve işleyen faizle birlikte iade edilir. Faiz hesabı için Depozito iadesi aracını kullanabilirsiniz.',
      },
    ],
  },
  {
    slug: 'ev-sahibi-yukumlulukleri',
    title: 'Ev sahibi yükümlülükleri',
    intro:
      'Kiraya verenin başlıca yükümlülükleri ve haklarının sınırları. Bu sayfa genel bilgidir; somut olay için hukuki destek alın.',
    sections: [
      {
        heading: 'Kiralananı elverişli teslim etmek',
        paragraphs: [
          'Kiraya veren, taşınmazı sözleşmede kararlaştırılan kullanıma elverişli durumda teslim etmek ve kira süresince bu durumda bulundurmakla yükümlüdür. Teslim sırasında taşınmazın durumunu fotoğraf ve tutanakla belgelemek her iki taraf için de faydalıdır.',
        ],
      },
      {
        heading: 'Kira artışında yasal sınır',
        paragraphs: [
          'Yenilenen dönem için istenebilecek kira bedeli, TÜFE 12 aylık ortalama değişim oranıyla sınırlıdır. Artışı kiracıya yazılı olarak ve ödeme tarihini belirterek bildirmek, ileride ihtilaf çıkmasını önler.',
        ],
        refs: ['Türk Borçlar Kanunu madde 344'],
      },
      {
        heading: 'Depozitonun saklanması ve iadesi',
        paragraphs: [
          'Alınan güvence en çok üç aylık kira bedeli olabilir. Tutar vadeli bir hesapta tutulur ve kira ilişkisi sona erdiğinde işleyen faiziyle birlikte iade edilir.',
        ],
        refs: ['Türk Borçlar Kanunu madde 342'],
      },
      {
        heading: 'Sözleşmeyi sona erdirme sınırları',
        paragraphs: [
          'Belirli süreli sözleşmede kiraya veren, süre bitiminde sözleşmeyi her zaman sona erdiremez. Konut ihtiyacı veya yeni malik gibi haller için kanundaki süre ve usul kurallarına uyulması gerekir.',
        ],
        refs: ['Türk Borçlar Kanunu madde 350 ve 351'],
      },
      {
        heading: 'Kira geliri ve vergi',
        paragraphs: [
          'Konut kira geliri belirli bir tutarı aşarsa beyan edilmelidir. İstisna tutarı ve vergi tarifesi her yıl değişir; Kira Cetveli bu değerleri veri dosyasından okur ve doğrulanmamış olanları açıkça işaretler.',
        ],
      },
    ],
    faq: [
      {
        q: 'Kira artışını sözlü bildirebilir miyim?',
        a: 'Yazılı bildirim ispat açısından önerilir. Yazılı bildirim taslağı için Kira artış bildirimi aracını kullanabilirsiniz.',
      },
      {
        q: 'Ödenmeyen kirada faiz isteyebilir miyim?',
        a: 'Sözleşmedeki veya yasal faiz oranı uygulanabilir. Tahmini tutar için Gecikme faizi aracını kullanın; oranı mutlaka doğrulayın.',
      },
    ],
  },
]
