import type { TokenPriceDetails } from "./__new/types/tokenPrice.model"
import type { BaseToken, Token } from "./__new/types/token.model"
import { equalToken } from "./__new/utils"
import { isArray } from "lodash-es"

export interface ILookupTokenPriceDetails {
  /** the token to query */
  token: BaseToken
  /** reponse from `/tokens/prices` endpoint */
  pricesData: TokenPriceDetails[] | undefined
  /** reponse from `/tokens/info` endpoint */
  tokenData: Token[] | undefined
}
/**
 * Given `token`, find the token in the `tokenData` and then the price details in `priceData`
 */

export const lookupTokenPriceDetails = ({
  token: baseToken,
  pricesData,
  tokenData,
}: ILookupTokenPriceDetails) => {
  if (
    !tokenData ||
    !isArray(tokenData) ||
    !pricesData ||
    !isArray(pricesData)
  ) {
    return
  }
  /** find token from tokenData by matching address */
  const tokenInPriceData = tokenData.find((token) =>
    equalToken(baseToken, token),
  )
  if (!tokenInPriceData) {
    return
  }
  /** find token price details from pricesData by matching priceId */
  return pricesData.find(
    ({ pricingId }) => pricingId === tokenInPriceData.pricingId,
  )
}
