import type { Token } from "../../../../../shared/token/__new/types/token.model"
import { parsedDefaultTokens } from "../../../../../shared/token/__new/utils"

export const getFeeToken = (networkId: string) =>
  parsedDefaultTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )

export const feeToken = getFeeToken("sepolia-alpha") as Token

export const feeTokenWithBalance = {
  ...feeToken,
  balance: BigInt("9875209405595349"),
}
