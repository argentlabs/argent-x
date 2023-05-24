import { useState } from "react"

interface ActionReturn<T extends (...args: any[]) => any> {
  action: T
  loading: boolean
  error?: Error
  result?: ReturnType<T>
}

export function useAction<T extends (...args: any[]) => any>(
  action: T,
): ActionReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [result, setResult] = useState<ReturnType<T>>()

  const wrappedAction = async (...args: Parameters<T>) => {
    setLoading(true)
    try {
      const result = await action(...args)
      setResult(result)
    } catch (error) {
      setError(
        error instanceof Error
          ? error
          : new Error(JSON.stringify(error), { cause: error }),
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    action: wrappedAction as T,
    loading,
    error,
    result,
  }
}
