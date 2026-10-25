import { Link, Outlet } from 'react-router-dom'
import { DataProvider } from '../lib/data/DataContext'
import { RoleProvider, useRole, type Role } from '../lib/role'
import { useTheme } from '../lib/theme'
import { Icon } from './Icon'
import styles from './Layout.module.css'

const roles: { id: Role; label: string }[] = [
  { id: 'tenant', label: 'Kiracıyım' },
  { id: 'landlord', label: 'Ev sahibiyim' },
]

function TopBar() {
  const [role, setRole] = useRole()
  const [theme, toggleTheme] = useTheme()
  return (
    <header className={styles.topbar} data-noprint>
      <Link to="/" className={styles.logo} aria-label="Kira Cetveli ana sayfa">
        Kira<span>Cetveli</span>
      </Link>
      <div className={styles.controls}>
        <div className={styles.segment} role="group" aria-label="Rolünüz">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={role === r.id}
              onClick={() => setRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  )
}

export function Layout() {
  return (
    <DataProvider>
      <RoleProvider>
        <div className={styles.ruler} aria-hidden="true" data-noprint />
        <div className={styles.shell}>
          <TopBar />
          <main id="icerik">
            <Outlet />
          </main>
          <footer className={styles.footer} data-noprint>
            <nav aria-label="Alt bağlantılar">
              <Link to="/araclar">Araçlar</Link>
              <Link to="/veri-kaynaklari">Veri kaynakları</Link>
              <Link to="/gizlilik">Gizlilik</Link>
              <Link to="/hakkinda">Hakkında</Link>
            </nav>
            <p>Girdiğiniz rakamlar cihazınızdan çıkmaz. Bu site hukuki danışmanlık vermez.</p>
          </footer>
        </div>
      </RoleProvider>
    </DataProvider>
  )
}
