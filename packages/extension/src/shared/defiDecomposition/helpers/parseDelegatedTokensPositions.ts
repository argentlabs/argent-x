import type {
  Address,
  ApiDefiDecompositionProduct,
  ApiDelegatedTokens,
} from "@argent/x-shared"
import { isDelegatedTokens } from "@argent/x-shared"
import type { BaseWalletAccount } from "../../wallet.model"
import type {
  ParsedDelegatedTokensPosition,
  PositionBaseToken,
} from "../schema"

export const parseDelegatedTokensPositions = (
  product: ApiDefiDecompositionProduct,
  account: BaseWalletAccount,
): ParsedDelegatedTokensPosition[] => {
  if (product.type !== "delegatedTokens" || product.positions.length === 0) {
    return []
  }

  const positions = product.positions as ApiDelegatedTokens[]

  const parsedPositions: ParsedDelegatedTokensPosition[] = positions
    .map((position) => {
      if (!isDelegatedTokens(position)) {
        return
      }

      const { id, data, totalBalances, tokenAddress } = position
      const { delegatingTo } = data

      const tokens: PositionBaseToken[] = []

      Object.entries(totalBalances).map(([address, balance]) => {
        tokens.push({
          address: address as `0x${string}`,
          balance,
          networkId: account.networkId,
        })
      })

      // only one token is expected
      if (tokens.length !== 1) {
        return
      }

      const liquidityToken = tokenAddress && {
        address: tokenAddress as Address,
        networkId: account.networkId,
      }

      return {
        id,
        delegatingTo,
        token: tokens[0],
        liquidityToken,
      }
    })
    .filter((position) => position !== undefined)

  return parsedPositions
}
