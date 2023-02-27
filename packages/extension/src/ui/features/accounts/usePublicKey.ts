import { useCallback, useEffect, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getPublicKey } from "../../services/backgroundAccounts"

export const usePublicKey = (account?: BaseWalletAccount) => {
  const [pubKey, setPubKey] = useState<string>()

  const getPubKeyCallback = useCallback(() => getPublicKey(account), [account])

  useEffect(() => {
    getPubKeyCallback().then(setPubKey)
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return pubKey
}
