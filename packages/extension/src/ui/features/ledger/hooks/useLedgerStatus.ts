import { useLedgerDeviceConnection } from "./useLedgerDeviceConnection"
import { isLedgerSigner } from "../utils"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { useWalletAccount } from "../../accounts/accounts.state"

export function useLedgerStatus(baseAccount?: BaseWalletAccount) {
  const isLedgerConnected = useLedgerDeviceConnection()
  const account = useWalletAccount(baseAccount)
  return account && isLedgerSigner(account) && isLedgerConnected
}
