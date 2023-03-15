import { BaseWalletAccount } from "../../../../shared/wallet.model"
import {
  isZeroMultisigAccount,
  useMultisigWalletAccount,
} from "../multisig.state"

export type MultisigStatus = "pending" | "ready" | "unknown"

export function useMultisigStatus(account: BaseWalletAccount): MultisigStatus {
  const multisigAccount = useMultisigWalletAccount(account)

  if (!multisigAccount) {
    return "unknown"
  }

  if (isZeroMultisigAccount(multisigAccount)) {
    return "pending"
  }

  return "ready"
}
