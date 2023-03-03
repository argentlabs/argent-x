import { useCallback, useEffect, useState } from "react"

import { getPublicKey } from "../../services/backgroundAccounts"

export const usePublicKey = () => {
  const [pubKey, setPubKey] = useState<string>()

  const getPubKeyCallback = useCallback(getPublicKey, [])

  useEffect(() => {
    getPubKeyCallback().then(setPubKey)
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return pubKey
}
