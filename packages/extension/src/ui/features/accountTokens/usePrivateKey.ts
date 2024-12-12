import { useCallback, useEffect, useState } from "react"

import { accountMessagingService } from "../../services/accountMessaging"
import type { AccountId } from "../../../shared/wallet.model"

export const usePrivateKey = (accountId?: string) => {
  const [privateKey, setPrivateKey] = useState<string>()

  const getPrivateKeyCallback = useCallback(
    (accountId: AccountId) => accountMessagingService.getPrivateKey(accountId),
    [],
  )

  useEffect(() => {
    if (accountId) {
      void getPrivateKeyCallback(accountId).then(setPrivateKey)
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return privateKey
}
