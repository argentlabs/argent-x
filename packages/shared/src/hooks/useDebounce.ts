import { useRef, useEffect } from "react"

export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) {
  const funcRef = useRef(func)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Update funcRef.current if func changes
  useEffect(() => {
    funcRef.current = func
  }, [func])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  // Return debounced function
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => funcRef.current(...args), wait)
  }
}
