import { useMemo } from "react"
import type { SwapQuoteRoute } from "../../../../shared/swap/model/quote.model"
import { useView } from "../../../views/implementation/react"
import { knownDappsWithIds } from "../../../views/knownDapps"
import { getProvidersFromTradeRoute } from "../utils"

export const useSwapTradeProviders = (tradeRoute?: SwapQuoteRoute) => {
  const providers = getProvidersFromTradeRoute(tradeRoute)
  const dapps = useView(
    knownDappsWithIds(
      providers.map((p) => p.dappId).filter((id) => id !== undefined),
    ),
  )

  const providersWithIconUrl = useMemo(
    () =>
      providers.map((p) => ({
        name: p.name,
        iconUrl: dapps.find((d) => d.dappId === p.dappId)?.logoUrl,
      })),
    [providers, dapps],
  )

  if (!tradeRoute) {
    return []
  }

  return providersWithIconUrl
}
