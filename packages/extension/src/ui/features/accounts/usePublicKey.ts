import { utils } from "ethers"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  getNextPublicKey,
  getPublicKey,
} from "../../services/backgroundAccounts"

export const usePublicKey = (account?: BaseWalletAccount) => {
  const [pubKey, setPubKey] = useState<string>()

  const getPubKeyCallback = useCallback(() => getPublicKey(account), [account])

  useEffect(() => {
    // on mount
    getPubKeyCallback().then(setPubKey)

    return () => {
      // on unmount
      setPubKey(undefined)
    }
  }, [getPubKeyCallback])

  return pubKey
}

export const useNextPublicKey = (networkId: string) => {
  const [pubKey, setPubKey] = useState<string>()

  const getNextPubKeyCallback = useCallback(
    () => getNextPublicKey(networkId),
    [networkId],
  )

  useEffect(() => {
    // on mount
    getNextPubKeyCallback().then(setPubKey)

    return () => {
      // on unmount
      setPubKey(undefined)
    }
  }, [getNextPubKeyCallback])

  return pubKey
}

export const useEncodedPublicKey = (pubKey: string | undefined) => {
  return useMemo(() => pubKey && utils.base58.encode(pubKey), [pubKey])
}

/**
 *
 * @returns Signer Key (encoded public key) of the current account
 */
export const useSignerKey = () => {
  const pubKey = usePublicKey()
  const encodedPubKey = useEncodedPublicKey(pubKey)

  return encodedPubKey
}

/**
 *
 * @returns Signer Key (encoded public key) of the next account
 */
export const useNextSignerKey = (networkId: string) => {
  const pubKey = useNextPublicKey(networkId)
  const encodedPubKey = useEncodedPublicKey(pubKey)

  return encodedPubKey
}
