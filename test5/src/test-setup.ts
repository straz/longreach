import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// This file runs for every test, including the node-environment ones where
// there is no window at all.
const hasDom = typeof window !== 'undefined'

// jsdom has no layout, so scrollTo is unimplemented and logs on every call.
if (hasDom) window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  if (!hasDom) return
  // Screens persist into storage on every state change; without this, one
  // test's flow would resume inside the next.
  try {
    window.sessionStorage.clear()
    window.localStorage.clear()
  } catch {
    // Storage unavailable in this environment; nothing to clear.
  }
})
