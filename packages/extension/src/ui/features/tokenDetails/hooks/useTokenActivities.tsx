import type { Address } from "@argent/x-shared"
import useSWR from "swr"
import { clientTokenDetailsService } from "../../../services/tokenDetails"
import { useView } from "../../../views/implementation/react"
import { selectedAccountView } from "../../../views/account"

export const useTokenActivities = (tokenAddress?: Address) => {
  const account = useView(selectedAccountView)
  return useSWR(
    account && tokenAddress
      ? [account.id, tokenAddress, "tokenActivities"]
      : null,
    async () => {
      if (!tokenAddress || !account) {
        return undefined
      }

      const result = await clientTokenDetailsService.fetchTokenActivities({
        tokenAddress,
        account,
      })

      return result
    },
    {
      refreshInterval: 1000 * 60,
      dedupingInterval: 1000 * 15,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}
