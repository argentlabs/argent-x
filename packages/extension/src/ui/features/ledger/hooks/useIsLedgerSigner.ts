import { useMemo } from "react"
import { isLedgerSigner } from "../utils"
import type { AccountId } from "../../../../shared/wallet.model"
import { useWalletAccount } from "../../accounts/accounts.state"

export function useIsLedgerSigner(accountId?: AccountId) {
  const account = useWalletAccount(accountId)
  return useMemo(() => !!account && isLedgerSigner(account), [account])
}
