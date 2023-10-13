import { useCallback, useEffect, useMemo, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountMessagingService } from "../../services/accountMessaging"
import { encodeBase58 } from "@argent/shared"

export const usePublicKey = (account?: BaseWalletAccount) => {
  const [pubKey, setPubKey] = useState<string>()

  const getPubKeyCallback = useCallback(
    () => accountMessagingService.getPublicKey(account),
    [account],
  )

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
    () => accountMessagingService.getNextPublicKeyForMultisig(networkId),
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
  return useMemo(() => pubKey && encodeBase58(pubKey), [pubKey])
}

export const useEncodedPublicKeys = (pubKeys: string[]) => {
  return useMemo(() => pubKeys.map((key) => encodeBase58(key)), [pubKeys])
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
