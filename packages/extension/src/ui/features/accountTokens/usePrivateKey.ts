import { useCallback, useEffect, useState } from "react"

import { getPrivateKey } from "../../services/backgroundAccounts"

export const usePrivateKey = () => {
  const [privateKey, setPrivateKey] = useState<string>()

  const getPrivateKeyCallback = useCallback(getPrivateKey, [])

  useEffect(() => {
    getPrivateKeyCallback().then(setPrivateKey)
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return privateKey
}
