import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Nav.module.css'

const ITEMS = [
  { to: '/inherited-authority', label: 'Inherited Authority' },
  { to: '/beat-the-calendar', label: 'Beat the Calendar' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      <header className={styles.bar}>
        <div className={styles.brand}>
          <a href="https://longreach.ai" target="_blank" rel="noopener noreferrer">
            <img
              className={styles.logo}
              src={`${import.meta.env.BASE_URL}longreach-logo.svg`}
              alt="Longreach"
            />
          </a>
          <Link to="/" className={styles.wordmark} onClick={() => setOpen(false)}>
            Aha!rtifacts
          </Link>
        </div>
        <button
          className={styles.toggle}
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className={styles.toggleBars}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <nav className={styles.menu}>
            <div className={styles.menuHeader}>
              <strong>Choose an artifact</strong>
              <button className={styles.close} aria-label="Close menu" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            {ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  location.pathname === item.to
                    ? `${styles.menuLink} ${styles.menuLinkActive}`
                    : styles.menuLink
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
