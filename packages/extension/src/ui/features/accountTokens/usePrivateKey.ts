import { useCallback, useEffect, useState } from "react"

import { getPrivateKey } from "../../services/messaging"

export const usePrivateKey = () => {
  const [privateKey, setPrivateKey] = useState<string>()

  const getPrivateKeyCallback = useCallback(getPrivateKey, [])

  useEffect(() => {
    getPrivateKeyCallback().then(setPrivateKey)
  }, [])

  return privateKey
}
