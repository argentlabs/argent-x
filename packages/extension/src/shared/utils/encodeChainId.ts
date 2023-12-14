import { isNumber } from "lodash-es"
import { num, shortString } from "starknet"

export function encodeChainId(chainId?: string | number) {
  if (!chainId) {
    return
  }

  if (isNumber(chainId)) {
    // Number type of chainId are rarerly used on Starknet, but we still need to support them
    // encodeShortString("1") doesn't work
    return num.toHex(chainId)
  }

  return num.isHex(chainId) ? chainId : shortString.encodeShortString(chainId)
}
