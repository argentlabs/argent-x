import type { Address } from "@argent/x-shared"
import useSWR from "swr"
import type { TimeFrameOption } from "@argent/x-ui"
import { clientTokenDetailsService } from "../../../services/tokenDetails"

const DEFAULT_CURRENCY = {
  code: "USD",
  decimals: 2,
  name: "United States Dollar",
  symbol: "$",
}

export const useTokenGraphInfo = (
  tokenAddress?: Address,
  timeFrame?: TimeFrameOption,
) => {
  // TBD whether we want to have something more custom here
  const currency = DEFAULT_CURRENCY

  return useSWR(
    tokenAddress && currency
      ? `${tokenAddress}-${currency}-${timeFrame}`
      : null,
    async () => {
      if (!tokenAddress) {
        return undefined
      }

      const result = await clientTokenDetailsService.fetchTokenGraph({
        tokenAddress,
        currency: currency?.code,
        timeFrame: timeFrame ?? "oneDay",
        chain: "starknet",
      })

      return {
        info: result?.info,
        prices: result?.prices,
      }
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
