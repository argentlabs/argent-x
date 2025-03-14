import { networkView } from "./network"
import { argentDb } from "../../shared/idb/argentDb"
import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { atomFromQuery } from "./implementation/atomFromQuery"
import { isEqualAddress } from "@argent/x-shared"
import { atomWithDebugLabel } from "./atomWithDebugLabel"
import { DEPRECATED_WSTETH_TOKEN_ADDRESS } from "../../shared/network/constants"

export const allTokensView = atomWithDebugLabel(
  atomFromQuery(() => argentDb.tokens.toArray()),
  `allTokensView`,
)

export const allTokensInfoView = atomWithDebugLabel(
  atomFromQuery(() => argentDb.tokensInfo.toArray()),
  `allTokensInfoView`,
)

export const allTokenBalancesView = atomWithDebugLabel(
  atomFromQuery(() => argentDb.tokenBalances.toArray()),
  `allTokenBalancesView`,
)

export const allTokenPricesView = atomWithDebugLabel(
  atomFromQuery(() => argentDb.tokenPrices.toArray()),
  `allTokenPricesView`,
)

export const ethTokenOnNetworkView = atomFamily((networkId?: string) =>
  atomWithDebugLabel(
    atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.find(
        (t) => t.symbol === "ETH" && t.networkId === networkId,
      )
    }),
    `ethTokenOnNetworkView-${networkId}`,
  ),
)

export const deprecatedWstEthTokenOnNetworkView = atomFamily(
  (networkId?: string) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const allTokens = await get(allTokensView)
        return allTokens.find(
          (t) =>
            isEqualAddress(t.address, DEPRECATED_WSTETH_TOKEN_ADDRESS) &&
            t.networkId === networkId,
        )
      }),
      `wstEthTokenOnNetworkView-${networkId}`,
    ),
)

/**
 * @returns Fee Token for a given network
 */
export const networkFeeTokensOnNetworkFamily = atomFamily(
  (networkId?: string) =>
    atomWithDebugLabel(
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
      `networkFeeTokensOnNetworkFamily-${networkId}`,
    ),
)
