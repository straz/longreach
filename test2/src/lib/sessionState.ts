import { useEffect, useState } from 'react'

export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = sessionStorage.getItem(key)
    if (!stored) return initial
    try {
      return JSON.parse(stored) as T
    } catch {
      return initial
    }
  })

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  const clear = () => {
    sessionStorage.removeItem(key)
    setValue(initial)
  }

  return [value, setValue, clear] as const
}
