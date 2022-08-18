import defaultTokens from "../../assets/default-tokens.json"
import { isEqualAddress } from "../../ui/services/addresses"
import { PublicNetworkIds } from "../network/public"
import { BaseToken, Token } from "./type"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.address === b.address && a.networkId === b.networkId

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: parseInt(token.decimals, 10),
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const getFeeToken = (networkId: string) =>
  parsedDefaultTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )

export const getTokenForContractAddress = (
  contractAddress: string,
  networkId?: PublicNetworkIds,
) => {
  if (networkId) {
    return parsedDefaultTokens.find(
      ({ networkId: network, address }) =>
        network === networkId && isEqualAddress(address, contractAddress),
    )
  } else {
    return parsedDefaultTokens.find(({ address }) =>
      isEqualAddress(address, contractAddress),
    )
  }
}
