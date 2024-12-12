import { useLedgerDeviceConnection } from "./useLedgerDeviceConnection"
import { isLedgerSigner } from "../utils"
import type { AccountId } from "../../../../shared/wallet.model"
import { useWalletAccount } from "../../accounts/accounts.state"

export function useLedgerStatus(accountId?: AccountId) {
  const isLedgerConnected = useLedgerDeviceConnection()
  const account = useWalletAccount(accountId)
  return account && isLedgerSigner(account) && isLedgerConnected
}
