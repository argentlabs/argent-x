import { useMemo } from "react"

import { Account } from "../accounts/Account"
import { tokenBalanceForAccountView } from "../../views/tokenBalances"
import { useView } from "../../views/implementation/react"
import { equalToken } from "../../../shared/token/__new/utils"
import { Token } from "../../../shared/token/__new/types/token.model"
import { ethTokenOnNetworkView } from "../../views/token"
import { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"

/**
 * Interface for the arguments of useTokenBalanceForAccount function
 */
interface UseTokenBalanceForAccountArgs {
  token?: Token
  account?: Pick<Account, "network" | "address" | "networkId">
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
  const tokenBalancesForAccount = useView(tokenBalanceForAccountView(account))
  const ethToken = useView(ethTokenOnNetworkView(account?.networkId))

  return useMemo(() => {
    if (!token || !account) {
      return undefined
    }

    // Find the token balance for the account
    const tokenBalance = tokenBalancesForAccount?.find((t) =>
      equalToken(t, token),
    )

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
  }, [account, ethToken, token, tokenBalancesForAccount])
}
