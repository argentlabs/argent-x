import { utils } from "ethers"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  getNextPublicKey,
  getPublicKey,
} from "../../services/backgroundAccounts"
import { useCurrentNetwork } from "../networks/useNetworks"

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

export const useNextPublicKey = () => {
  const network = useCurrentNetwork()
  const [pubKey, setPubKey] = useState<string>()

  const getNextPubKeyCallback = useCallback(
    () => getNextPublicKey(network.id),
    [network.id],
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

export const useEncodedPublicKeys = (pubKeys: string[]) => {
  return useMemo(
    () => pubKeys.map((key) => utils.base58.encode(key)),
    [pubKeys],
  )
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
export const useNextSignerKey = () => {
  const pubKey = useNextPublicKey()
  const encodedPubKey = useEncodedPublicKey(pubKey)
  return encodedPubKey
}
