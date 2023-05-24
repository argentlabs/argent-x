import { BigNumber, utils } from "ethers"
import { number, uint256 } from "starknet"

import { isNumeric } from "./number"

export const parseAmount = (
  amount: string,
  decimals: number.BigNumberish = 18,
) => {
  const amountNoComma = amount.replace(",", ".")
  if (!isNumeric(amountNoComma)) {
    return BigNumber.from(0)
  }

  return utils.parseUnits(amountNoComma, number.toBN(decimals).toNumber())
}
export const getUint256CalldataFromBN = (bn: BigNumber) => ({
  type: "struct" as const,
  ...uint256.bnToUint256(bn.toHexString()),
})
