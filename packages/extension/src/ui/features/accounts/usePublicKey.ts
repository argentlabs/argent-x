import { useCallback, useEffect, useMemo, useState } from "react"

import { decodeBase58, encodeBase58 } from "@argent/x-shared"
import type {
  CreateAccountType,
  SignerType,
} from "../../../shared/wallet.model"
import { useOnMountUnsafe } from "../../hooks/useOnMountUnsafe"
import { accountMessagingService } from "../../services/accountMessaging"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import { useLedgerStatus } from "../ledger/hooks/useLedgerStatus"

export const usePublicKey = (accountId?: string) => {
  const [pubKey, setPubKey] = useState<string>()
  const isLedgerSigner = useIsLedgerSigner(accountId)
  const isLedgerConnected = useLedgerStatus(accountId)

  const getPubKeyCallback = useCallback(async () => {
    try {
      return await accountMessagingService.getPublicKey(accountId)
    } catch (e) {
      console.error(e)
      return
    }
  }, [accountId])

  useEffect(() => {
    if (isLedgerSigner && !isLedgerConnected) {
      return
    }
    // on mount
    void getPubKeyCallback().then((val) => !!val && setPubKey(val))

    return () => {
      // on unmount
      setPubKey(undefined)
    }
  }, [getPubKeyCallback, isLedgerConnected, isLedgerSigner])

  return pubKey
}

export const useNextPublicKey = (
  accountType: CreateAccountType,
  signerType: SignerType,
  networkId: string,
) => {
  const [pubKey, setPubKey] = useState<string>()
  const [derivationPath, setDerivationPath] = useState<string>()
  const [index, setIndex] = useState<number>()

  const getNextPubKeyCallback = useCallback(async () => {
    return accountMessagingService.getNextPublicKey(
      accountType,
      signerType,
      networkId,
    )
  }, [accountType, networkId, signerType])

  // Need this to prevent multiple calls to the ledger when the component is mounted in dev mode
  useOnMountUnsafe(
    () => {
      // on mount
      void getNextPubKeyCallback().then((result) => {
        setPubKey(result.publicKey)
        setDerivationPath(result.derivationPath)
        setIndex(result.index)
      })
    },
    () => {
      // on unmount
      setPubKey(undefined)
      setDerivationPath(undefined)
      setIndex(undefined)
    },
  )

  return { pubKey, derivationPath, index }
}

export const useEncodedPublicKey = (pubKey: string | undefined) => {
  return useMemo(() => pubKey && encodeBase58(pubKey), [pubKey])
}

export const useEncodedPublicKeys = (pubKeys: string[]) => {
  return useMemo(() => pubKeys.map((key) => encodeBase58(key)), [pubKeys])
}

/** Get decoded public key from base58 signer key */
export const useDecodedSignerKey = (signerKey: string | undefined) =>
  useMemo(() => signerKey && decodeBase58(signerKey), [signerKey])

/**
 *
 * @returns Signer Key (encoded public key) of the current account
 */
export const useSignerKey = (accountId?: string) => {
  const pubKey = usePublicKey(accountId)
  const encodedPubKey = useEncodedPublicKey(pubKey)

  return encodedPubKey
}

/**
 *
 * @returns Signer Key (encoded public key) of the next account
 */
export const useNextSignerKey = (
  accountType: CreateAccountType,
  signerType: SignerType,
  networkId: string,
) => {
  const { pubKey, derivationPath, index } = useNextPublicKey(
    accountType,
    signerType,
    networkId,
  )
  const encodedPubKey = useEncodedPublicKey(pubKey)
  return { pubKey: encodedPubKey, derivationPath, index }
}
