import { useCallback, useEffect, useState } from "react"

import { getPrivateKey } from "../../services/backgroundAccounts"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"

export const usePrivateKey = (address?: string, networkId?: string) => {
  const [privateKey, setPrivateKey] = useState<string>()

  const getPrivateKeyCallback = useCallback(getPrivateKey, [])

  useEffect(() => {
    if (address && networkId) {
      getPrivateKeyCallback({ address, networkId }).then(setPrivateKey)
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return privateKey
}

export const usePrivateKeyForSelectedAccount = () => {
  const account = useView(selectedAccountView)
  return usePrivateKey(account?.address, account?.networkId)
}
