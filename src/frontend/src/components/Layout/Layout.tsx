import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.scss'

const NAV_ITEMS = [
  { path: '/', label: 'Главная' },
  { path: '/interview', label: 'Интервью' },
  { path: '/history', label: 'История' },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>AI</span>
            <span className={styles.logoText}>InterviewAI</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${styles.navLink} ${pathname === path ? styles.active : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
