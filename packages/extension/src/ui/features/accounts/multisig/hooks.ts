import {
  BaseWalletAccount,
  MultisigData,
} from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { usePublicKey } from "../usePublicKey"
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

  return useConditionallyEnabledSWR<MultisigData | undefined>(
    Boolean(process.env.FEATURE_MULTISIG),
    [
      "multisigDataForSigner",
      multisigAccount && getAccountIdentifier(multisigAccount),
      publicSigner,
    ],
    async () => {
      if (!multisigAccount || !publicSigner) {
        return
      }

      if (!isZeroMultisigAccount(multisigAccount)) {
        return {
          signers: multisigAccount.signers,
          threshold: multisigAccount.threshold,
          multisigAddress: multisigAccount.multisigAddress,
          creator: multisigAccount.creator,
        }
      }

      const data = await fetchMultisigDataForSigner({
        signer: publicSigner,
        network: multisigAccount.network,
      })

      return {
        signers: data.content[0].signers,
        threshold: data.content[0].threshold,
        multisigAddress: data.content[0].address,
        creator: data.content[0].creator,
      }
    },
  )
}
