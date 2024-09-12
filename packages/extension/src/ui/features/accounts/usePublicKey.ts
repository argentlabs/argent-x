import { useCallback, useEffect, useMemo, useState } from "react"

import {
  BaseWalletAccount,
  CreateAccountType,
  SignerType,
} from "../../../shared/wallet.model"
import { accountMessagingService } from "../../services/accountMessaging"
import { decodeBase58, encodeBase58 } from "@argent/x-shared"
import { useOnMountUnsafe } from "../../hooks/useOnMountUnsafe"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import { useLedgerStatus } from "../ledger/hooks/useLedgerStatus"

export const usePublicKey = (account?: BaseWalletAccount) => {
  const [pubKey, setPubKey] = useState<string>()
  const isLedgerSigner = useIsLedgerSigner(account)
  const isLedgerConnected = useLedgerStatus(account)

  const getPubKeyCallback = useCallback(async () => {
    try {
      return await accountMessagingService.getPublicKey(account)
    } catch (e) {
      console.error(e)
      return
    }
  }, [account])

  useEffect(() => {
    if (isLedgerSigner && !isLedgerConnected) {
      return
    }
    // on mount
    getPubKeyCallback().then((val) => !!val && setPubKey(val))

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
      getNextPubKeyCallback().then(setPubKey)
    },
    () => {
      // on unmount
      setPubKey(undefined)
    },
  )

  return pubKey
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
export const useSignerKey = (account?: BaseWalletAccount) => {
  const pubKey = usePublicKey(account)
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
  const pubKey = useNextPublicKey(accountType, signerType, networkId)
  const encodedPubKey = useEncodedPublicKey(pubKey)
  return encodedPubKey
}
