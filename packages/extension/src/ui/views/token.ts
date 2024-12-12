import { networkView } from "./network"
import { argentDb } from "../../shared/idb/argentDb"
import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { atomFromQuery } from "./implementation/atomFromQuery"
import { isEqualAddress } from "@argent/x-shared"

export const allTokensView = atomFromQuery(() => argentDb.tokens.toArray())

export const allTokensInfoView = atomFromQuery(() =>
  argentDb.tokensInfo.toArray(),
)

export const allTokenBalancesView = atomFromQuery(() =>
  argentDb.tokenBalances.toArray(),
)

export const allTokenPricesView = atomFromQuery(() =>
  argentDb.tokenPrices.toArray(),
)

export const ethTokenOnNetworkView = atomFamily(
  (networkId?: string) => {
    return atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.find(
        (t) => t.symbol === "ETH" && t.networkId === networkId,
      )
    })
  },
  (a, b) => a === b,
)

/**
 * @returns Fee Token for a given network
 */
export const networkFeeTokensOnNetworkFamily = atomFamily(
  (networkId?: string) =>
    atom(async (get) => {
      if (!networkId) {
        return
      }
      const tokens = await argentDb.tokens.toArray()
      const network = await get(networkView(networkId))
      if (!network) {
        return
      }
      return tokens.filter(
        (token) =>
          network.possibleFeeTokenAddresses.some((feeTokenAddress) =>
            isEqualAddress(feeTokenAddress, token.address),
          ) && token.networkId === networkId,
      )
    }),
)
