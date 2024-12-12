import { useMemo } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useTokensWithBalanceForAccount } from "./tokens.state"

export const useHasNonZeroBalance = (account?: WalletAccount) => {
  const tokenDetails = useTokensWithBalanceForAccount(account)
  return useMemo(() => {
    return tokenDetails.some(({ balance }) => balance && balance > 0n)
  }, [tokenDetails])
}
