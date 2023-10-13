import { useCallback, useEffect, useState } from "react"

import { accountMessagingService } from "../../services/accountMessaging"
import { BaseWalletAccount } from "../../../shared/wallet.model"

export const usePrivateKey = (
  address: string | undefined,
  networkId: string | undefined,
) => {
  const [privateKey, setPrivateKey] = useState<string>()

  const getPrivateKeyCallback = useCallback(
    (account: BaseWalletAccount) =>
      accountMessagingService.getPrivateKey(account),
    [],
  )

  useEffect(() => {
    if (address && networkId) {
      getPrivateKeyCallback({ address, networkId }).then(setPrivateKey)
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return privateKey
}
