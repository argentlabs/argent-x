import { useMemo } from "react"

import type { Token } from "../../../shared/token/__new/types/token.model"
import type { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"
import { equalToken } from "../../../shared/token/__new/utils"
import { tokenBalancesForAccountAndTokenView } from "../../views/tokenBalances"
import { ethTokenOnNetworkView } from "../../views/token"
import { useView } from "../../views/implementation/react"
import type { WalletAccount } from "../../../shared/wallet.model"

/**
 * Interface for the arguments of useTokenBalanceForAccount function
 */
interface UseTokenBalanceForAccountArgs {
  token?: Token
  account?: Pick<WalletAccount, "id" | "address" | "networkId">
}

/**
 * This hook returns cached token balance for account which is fetched by the worker
 * @param {UseTokenBalanceForAccountArgs} - An object containing token and account
 * @returns {Token | undefined} - Returns the token with balance or undefined
 */
export function useTokenBalanceForAccount({
  token,
  account,
}: UseTokenBalanceForAccountArgs): TokenWithOptionalBigIntBalance | undefined {
  const ethToken = useView(ethTokenOnNetworkView(account?.networkId))
  const tokenBalance = useView(
    tokenBalancesForAccountAndTokenView({ account, token }),
  )
  return useMemo(() => {
    if (!token || !account) {
      return undefined
    }

    // If token balance is not found and token is ETH, return token with balance 0
    // Required for the UI to show the balance of ETH
    if (!tokenBalance && ethToken && equalToken(token, ethToken)) {
      return {
        ...ethToken,
        balance: BigInt(0),
      }
    }

    // If token balance is found, return the token with the balance
    return tokenBalance
      ? {
          ...token,
          balance: BigInt(tokenBalance.balance),
        }
      : undefined
  }, [account, ethToken, token, tokenBalance])
}
