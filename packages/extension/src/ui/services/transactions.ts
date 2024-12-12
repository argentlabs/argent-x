import type { BigNumberish } from "starknet"
import { uint256 } from "starknet"

export function getUint256CalldataFromBN(bn: BigNumberish) {
  return uint256.bnToUint256(bn)
}
