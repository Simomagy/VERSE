import { useEffect, useRef } from 'react'

export function useAutoRefresh(callback: () => void, intervalMs: number, enabled = true): void {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => callbackRef.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
}
