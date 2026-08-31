import { useEffect, useState } from 'react'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (!stored) return initial
    try {
      const parsed = JSON.parse(stored)
      // Merge onto the initial shape so a stored blob written before a new
      // field existed still gets that field's default.
      if (isPlainObject(initial) && isPlainObject(parsed)) {
        return { ...initial, ...parsed } as T
      }
      return parsed as T
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
