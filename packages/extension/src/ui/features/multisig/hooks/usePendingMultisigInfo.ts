import { useEffect, useState } from "react"

import { BasePendingMultisig } from "../../../../shared/multisig/types"
import { pendingMultisigToMultisig } from "../../../../shared/multisig/utils/pendingMultisig"
import { MultisigWalletAccount } from "../../../../shared/wallet.model"
import { useMultisigDataForSigner } from "./useMultisigDataForSigner"

export function usePendingMultisigInfo(
  basePendingMultisig: BasePendingMultisig,
) {
  const { data: multisigData } = useMultisigDataForSigner(basePendingMultisig)
  const [multisigWalletAccount, setMultisigWalletAccount] = useState<
    MultisigWalletAccount | undefined
  >(undefined)

  useEffect(() => {
    if (basePendingMultisig && multisigData) {
      pendingMultisigToMultisig(basePendingMultisig, multisigData).then((m) =>
        setMultisigWalletAccount(m),
      )
    }

    ;() => {
      setMultisigWalletAccount(undefined)
    }
  }, [basePendingMultisig, multisigData])

  return multisigWalletAccount
}
