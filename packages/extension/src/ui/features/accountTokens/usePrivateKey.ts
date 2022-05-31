import { useCallback, useEffect, useState } from "react"

import { getPrivateKey } from "../../services/messaging"

export const usePrivateKey = () => {
  const [privateKey, setPrivateKey] = useState<string | undefined>(undefined)

  const getPrivateKeyCallback = useCallback(
    async () => await getPrivateKey(),
    [],
  )

  useEffect(() => {
    getPrivateKeyCallback().then((pk) => setPrivateKey(pk))
  }, [])

  return privateKey
}
