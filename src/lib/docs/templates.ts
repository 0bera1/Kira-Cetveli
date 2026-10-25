import { formatLira, formatPercent, toKurus } from '../rent/money'

export const DISCLAIMER =
  'Bu belge bir taslaktır ve hukuki danışmanlık değildir. Göndermeden önce içeriği kontrol edin; gerekirse bir avukata danışın.'

const trDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDateTr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '...'
  return trDate.format(new Date(`${iso}T00:00:00`))
}

const blank = (v: string, fallback = '..........') => (v.trim() ? v.trim() : fallback)

export interface IncreaseNoticeInput {
  sender: string
  recipient: string
  address: string
  currentRent: number
  newRent: number
  ratePercent: number
  effectiveDate: string
  date: string
}

export function increaseNoticeText(i: IncreaseNoticeInput): string {
  const money = (n: number) => (Number.isFinite(n) && n > 0 ? formatLira(toKurus(n)) : '..........')
  return [
    `Tarih: ${formatDateTr(i.date)}`,
    `Gönderen: ${blank(i.sender)}`,
    `Alıcı: ${blank(i.recipient)}`,
    `Kiralanan taşınmaz: ${blank(i.address)}`,
    `Konu: Kira bedeli artışının bildirimi`,
    `Yukarıda adresi belirtilen taşınmaza ilişkin kira sözleşmesi kapsamında, mevcut aylık kira bedeli ${money(i.currentRent)} tutarındadır.`,
    `Türk Borçlar Kanunu madde 344 hükmü ve sözleşme şartları çerçevesinde, ${formatDateTr(i.effectiveDate)} tarihinden itibaren geçerli olmak üzere aylık kira bedelinin ${formatPercent(i.ratePercent)} oranında artırılarak ${money(i.newRent)} olarak uygulanacağını bildiririm.`,
    `Uygulanan oranın, ilgili dönem için geçerli TÜFE 12 aylık ortalama değişim oranını aşmadığı tarafımca kontrol edilmiştir. Yeni kira bedelinin belirtilen tarihten itibaren ödenmesini rica ederim.`,
    `Saygılarımla,\n${blank(i.sender)}`,
  ].join('\n\n')
}

export type LeaveKind = 'tahliye' | 'depozito'

export interface LeaveNoticeInput {
  kind: LeaveKind
  sender: string
  recipient: string
  address: string
  date: string
  moveOutDate: string
  deposit: number
  iban: string
}

export function leaveNoticeText(i: LeaveNoticeInput): string {
  const head = [
    `Tarih: ${formatDateTr(i.date)}`,
    `Gönderen: ${blank(i.sender)}`,
    `Alıcı: ${blank(i.recipient)}`,
    `Kiralanan taşınmaz: ${blank(i.address)}`,
  ]
  if (i.kind === 'tahliye') {
    return [
      ...head,
      'Konu: Tahliye bildirimi',
      `Yukarıda adresi belirtilen taşınmaza ilişkin kira sözleşmesini sona erdirmek istediğimi, taşınmazı ${formatDateTr(i.moveOutDate)} tarihinde boşaltarak teslim edeceğimi bildiririm.`,
      'Teslim sırasında taşınmazın durumunun birlikte tespit edilmesini, anahtar teslimi ve sayaç okumalarının tutanağa bağlanmasını talep ederim.',
      `Saygılarımla,\n${blank(i.sender)}`,
    ].join('\n\n')
  }
  const amount =
    Number.isFinite(i.deposit) && i.deposit > 0 ? formatLira(toKurus(i.deposit)) : '..........'
  return [
    ...head,
    'Konu: Depozito iade talebi',
    `Yukarıda adresi belirtilen taşınmazı ${formatDateTr(i.moveOutDate)} tarihinde teslim etmiş bulunmaktayım. Kira sözleşmesi kapsamında depozito olarak yatırdığım ${amount} tutarının, işleyen faiziyle birlikte iadesini talep ederim.`,
    `İadenin aşağıdaki hesaba yapılmasını rica ederim.\nIBAN: ${blank(i.iban)}`,
    'Aksi halde yasal yollara başvuracağımı bildiririm.',
    `Saygılarımla,\n${blank(i.sender)}`,
  ].join('\n\n')
}

/** Splits template text into PDF blocks; "Konu:" lines become bold. */
export function textToBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p) => ({ text: p, bold: p.startsWith('Konu:'), gap: 6 }))
}
