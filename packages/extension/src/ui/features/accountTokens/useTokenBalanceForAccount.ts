import { useEffect, useRef } from "react"
import useSWR, { SWRConfiguration } from "swr"

import { getTokenBalanceForWalletAccount } from "../../../shared/multicall"
import { BaseToken } from "../../../shared/token/type"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"

/**
 * Use Multicall to get the token balance for the account.
 * This will also mutate when the number of pending transactions decreases
 *
 * Returns balance as a string, or the error so the UI can choose if / how to display it to the user
 * this provides a way to handle errors using Suspense without ErrorBoundary
 */

export const useTokenBalanceForAccount = (
  token: BaseToken,
  account: Account,
  config?: SWRConfiguration,
) => {
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)
  const key = [
    "balanceOf",
    token.address,
    token.networkId,
    account.address,
    account.network.multicallAddress,
  ]
    .filter(Boolean)
    .join("-")
  const { data, mutate, ...rest } = useSWR<string | Error>(
    key,
    async () => {
      try {
        const balance = await getTokenBalanceForWalletAccount(
          token,
          account.toBaseWalletAccount(),
        )
        return balance
      } catch (error) {
        return error
      }
    },
    config,
  )

  // refetch when number of pending transactions goes down
  useEffect(() => {
    if (pendingTransactionsLengthRef.current > pendingTransactions.length) {
      mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  return {
    balanceOrError: data,
    mutate,
    ...rest,
  }
}
