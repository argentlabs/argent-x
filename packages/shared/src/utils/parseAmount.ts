import { uint256, BigNumberish } from "starknet"

import { isNumeric } from "./number"
import { parseUnits } from "../bigdecimal"

export const parseAmountValue = (
  amount: string,
  decimals: BigNumberish = 18,
) => {
  const amountNoComma = amount.replace(",", ".")
  if (!amount || !isNumeric(amountNoComma)) {
    return 0n
  }

  return parseUnits(amountNoComma, Number(decimals))
}
export function getUint256CalldataFromBN(bn: BigNumberish) {
  return uint256.bnToUint256(bn)
}
