import { useCallback, useEffect, useMemo } from "react"

import { ARGENT_MULTISIG_ENABLED } from "./../../../../shared/api/constants"
import { updateBaseMultisigAccount } from "../../../../shared/multisig/store"
import {
  BaseWalletAccount,
  MultisigData,
} from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { usePublicKey } from "../usePublicKey"
import { Multisig } from "./Multisig"
import { fetchMultisigDataForSigner } from "./multisig.service"
import { isZeroMultisigAccount, useMultisigAccount } from "./multisig.state"

export type MultisigStatus = "pending" | "ready" | "unknown"

export function useMultisigStatus(account: BaseWalletAccount): MultisigStatus {
  const multisigAccount = useMultisigAccount(account)

  if (!multisigAccount) {
    return "unknown"
  }

  if (isZeroMultisigAccount(multisigAccount)) {
    return "pending"
  }

  return "ready"
}

export function useMultisigDataForSigner(account: BaseWalletAccount) {
  const multisigAccount = useMultisigAccount(account)
  const publicSigner = usePublicKey(account)

  const multisigDataForSignerFetcher = useCallback(async () => {
    if (!multisigAccount || !publicSigner) {
      return
    }

    /** This seemed like a good idea at first but there's a problem with it:
    // The multisig account is not updated when the user adds a new signer.
    // So if the user adds a new signer, the multisig account will still be
    // considered a non-zero multisig account, and the fetcher will not be called. 
    ***/

    // if (!isZeroMultisigAccount(multisigAccount)) {
    //   return {
    //     signers: multisigAccount.signers,
    //     threshold: multisigAccount.threshold,
    //     multisigAddress: multisigAccount.multisigAddress,
    //     creator: multisigAccount.creator,
    //   }
    // }

    const data = await fetchMultisigDataForSigner({
      signer: publicSigner,
      network: multisigAccount.network,
    })

    if (!data || !data.content || data.content.length === 0) {
      if (!isZeroMultisigAccount(multisigAccount)) {
        return {
          signers: multisigAccount.signers,
          threshold: multisigAccount.threshold,
          creator: multisigAccount.creator,
        }
      }
      return
    }

    return {
      signers: data.content[0].signers,
      threshold: data.content[0].threshold,
      multisigAddress: data.content[0].address,
      creator: data.content[0].creator,
    }
  }, [multisigAccount, publicSigner])

  return useConditionallyEnabledSWR<MultisigData | undefined>(
    Boolean(ARGENT_MULTISIG_ENABLED),
    [
      "multisigDataForSigner",
      multisigAccount && getAccountIdentifier(multisigAccount),
      publicSigner,
    ],
    multisigDataForSignerFetcher,
    {
      refreshInterval: (latest) => (!latest ? 10e3 : 30e3), // if no data, refresh every 10s, otherwise every 30s
    },
  )
}

export interface IMultisigInfo {
  multisig?: Multisig
  status: MultisigStatus
}

export function useMultisigInfo(account: BaseWalletAccount): IMultisigInfo {
  const multisigAccount = useMultisigAccount(account)
  const { data: multisigData } = useMultisigDataForSigner(account)
  const multisigStatus = useMultisigStatus(account)

  useEffect(() => {
    if (!multisigAccount) {
      return
    }
    updateBaseMultisigAccount({ ...multisigAccount, ...multisigData })
  }, [multisigAccount, multisigData, multisigStatus])

  return useMemo(() => {
    if (!multisigAccount) {
      return {
        status: multisigStatus,
        multisig: undefined,
      }
    }

    return {
      status: multisigStatus,
      multisig: new Multisig({ ...multisigAccount, ...multisigData }),
    }
  }, [multisigAccount, multisigData, multisigStatus])
}
