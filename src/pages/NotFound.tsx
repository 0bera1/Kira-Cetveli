import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import styles from './Prose.module.css'

export default function NotFound() {
  return (
    <article className={styles.prose}>
      <Seo title="Sayfa bulunamadı" description="Aradığınız sayfa bulunamadı." path="/404" />
      <h1>Sayfa bulunamadı</h1>
      <p className={styles.lead}>Aradığınız sayfa yok veya taşınmış olabilir.</p>
      <p>
        <Link to="/">Ana sayfaya dön</Link> veya <Link to="/araclar">araçlara göz at</Link>.
      </p>
    </article>
  )
}
