import { ZxcvbnResult, zxcvbn, zxcvbnAsync } from "@zxcvbn-ts/core"
import { useDeferredValue, useEffect, useState } from "react"

export const usePasswordStrength = (
  password: string,
  loadingFn?: () => Promise<void>,
) => {
  const [result, setResult] = useState<ZxcvbnResult | null>(null)
  const deferredPassword = useDeferredValue(password)

  useEffect(() => {
    void loadingFn?.()
    // on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // avoid null error on zxcvbnAsync
    if (!deferredPassword) {
      setResult(null)
      return
    }
    void zxcvbnAsync(deferredPassword).then((response) => setResult(response))
  }, [deferredPassword])

  return result
}

export { zxcvbn, zxcvbnAsync }
