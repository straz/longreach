import styles from './Nav.module.css'

export function Nav() {
  return (
    <header className={styles.bar}>
      <a className={styles.brand} href="https://longreach.ai" target="_blank" rel="noopener noreferrer">
        <img
          className={styles.logo}
          src={`${import.meta.env.BASE_URL}longreach-logo.svg`}
          alt="Longreach logo"
        />
        <span className={styles.wordmark}>
          LONG<span className={styles.wordmarkBold}>REACH</span>
        </span>
      </a>
    </header>
  )
}
