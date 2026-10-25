import { ToolPage } from '../../components/ToolPage'
import styles from '../Prose.module.css'

export default function BolgeKiraKarsilastirma() {
  return (
    <ToolPage slug="bolge-kira-karsilastirma">
      <div className={styles.note}>
        <p>
          <strong>Yakında.</strong> Bu araç henüz çalışmıyor. Bölge bazlı kira verisi için güvenilir
          ve kullanım koşulları uygun bir veri kaynağı bağlanmadan sonuç üretmeyeceğiz; örnek veya
          tahmini rakamlar göstermiyoruz.
        </p>
      </div>
    </ToolPage>
  )
}
