import { useEffect, useMemo } from "react"

import { updateBaseMultisigAccount } from "../../../../shared/multisig/store"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { Multisig } from "../Multisig"
import { useMultisigAccount } from "../multisig.state"
import { useMultisigDataForSigner } from "./useMultisigDataForSigner"
import { MultisigStatus, useMultisigStatus } from "./useMultisigStatus"

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
