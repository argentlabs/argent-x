import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { isZeroMultisigAccount, useMultisigAccount } from "../multisig.state"

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
