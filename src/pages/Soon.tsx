import { Seo } from '../components/Seo'

export default function Soon({ title, path }: { title: string; path: string }) {
  return (
    <>
      <Seo title={title} description={`${title} sayfası hazırlanıyor.`} path={path} />
      <h1 style={{ fontSize: '2.4rem', margin: '24px 0 12px' }}>{title}</h1>
      <p>Bu sayfa hazırlanıyor.</p>
    </>
  )
}
