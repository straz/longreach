import { useEffect, useState } from 'react'

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (!stored) return initial
    try {
      return JSON.parse(stored) as T
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  const clear = () => {
    localStorage.removeItem(key)
    setValue(initial)
  }

  return [value, setValue, clear] as const
}
