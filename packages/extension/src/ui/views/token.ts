import { Atom, atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { atomFromRepo } from "./implementation/atomFromRepo"
import { equalToken } from "../../shared/token/__new/utils"
import { isEmpty } from "lodash-es"
import { networkView } from "./network"
import { tokenRepo } from "../../shared/token/__new/repository/token"
import { BaseToken, Token } from "../../shared/token/__new/types/token.model"

const allTokensAtom = atomFromRepo(tokenRepo)

export const allTokensView = atom(async (get) => {
  const tokens = await get(allTokensAtom)
  return tokens
})

/**
 * @returns ETH for ALL networks
 */
const ethTokensView = atom(async (get) => {
  const tokens = await get(allTokensAtom)
  const networkFeeToken = tokens.filter((token) => token.symbol === "ETH")

  return !isEmpty(networkFeeToken) ? networkFeeToken : []
})

export const ethTokenOnNetworkView = atomFamily(
  (networkId?: string) => {
    return atom(async (get) => {
      if (!networkId) {
        return
      }

      const tokens = await get(ethTokensView)
      return tokens.find((token) => token.networkId === networkId)
    })
  },
  (a, b) => !!a && !!b && a === b,
)

/**
 * @param view Atom of all tokens
 * @returns tokens for a specific network
 */
export const tokensOnNetworkFamilyFactory = (view: Atom<Promise<Token[]>>) =>
  atomFamily(
    (networkId?: string) =>
      atom(async (get) => {
        const tokens = await get(view)
        return tokens.filter((token) => token.networkId === networkId)
      }),
    (a, b) => a === b,
  )

/**
 * @returns all tokens for a given network
 */
export const allTokensOnNetworkFamily =
  tokensOnNetworkFamilyFactory(allTokensView)

/**
 * @returns Fee Token for a given network
 */
export const networkFeeTokensOnNetworkFamily = atomFamily(
  (networkId?: string) =>
    atom(async (get) => {
      if (!networkId) {
        return
      }
      const tokens = await get(allTokensView)
      const network = await get(networkView(networkId))
      if (!network) {
        return
      }
      return tokens.filter(
        (token) =>
          network.possibleFeeTokenAddresses.includes(token.address) &&
          token.networkId === networkId,
      )
    }),
)

export const tokenFindFamily = atomFamily(
  (baseToken?: BaseToken) =>
    atom(async (get) => {
      const tokens = await get(allTokensView)

      if (!baseToken) {
        return
      }

      return tokens.find((t) => equalToken(t, baseToken))
    }),
  (a, b) => (a && b ? equalToken(a, b) : false),
)
