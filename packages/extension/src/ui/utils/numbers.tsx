import { BigNumber } from "@ethersproject/bignumber"
import { uint256 } from "starknet"

export function getUint256CalldataFromBN(bn: BigNumber) {
  return {
    type: "struct" as const,
    ...uint256.bnToUint256(bn.toHexString()),
  }
}
