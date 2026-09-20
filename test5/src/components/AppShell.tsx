import type { ReactNode } from 'react'
import './AppShell.css'

/**
 * The page frame. The brand bar matches test4's: mark, then the wordmark set
 * in Roboto Slab with LONG light and REACH bold.
 */
export function AppShell({
  children,
  footer,
  nav,
}: {
  children: ReactNode
  footer: string
  nav?: ReactNode
}) {
  return (
    <div className="lr-shell">
      <header className="lr-shell__bar">
        <a
          className="lr-brand"
          href="https://longreach.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="lr-brand__logo"
            src={`${import.meta.env.BASE_URL}longreach-logo.svg`}
            alt="Longreach"
          />
          <span className="lr-brand__wordmark" aria-hidden="true">
            LONG<span className="lr-brand__wordmark-bold">REACH</span>
          </span>
        </a>
      </header>

      {nav}

      <main className="lr-shell__main" id="main">
        {children}
      </main>

      <footer className="lr-shell__footer">
        <p>{footer}</p>
      </footer>
    </div>
  )
}
