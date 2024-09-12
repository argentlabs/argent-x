import { useMemo } from "react"
import { isLedgerSigner } from "../utils"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { useWalletAccount } from "../../accounts/accounts.state"

export function useIsLedgerSigner(baseAccount?: BaseWalletAccount) {
  const account = useWalletAccount(baseAccount)
  return useMemo(() => !!account && isLedgerSigner(account), [account])
}
