import { useCallback, useEffect, useState } from "react"

import { getPrivateKey } from "../../services/backgroundAccounts"
import { useSelectedAccount } from "../accounts/accounts.state"

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
  const account = useSelectedAccount()
  return usePrivateKey(account?.address, account?.networkId)
}
