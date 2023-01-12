import { number, stark } from "starknet"

export const argentMaxFee = (suggestedMaxFee: number.BigNumberish) =>
  number.toHex(stark.estimatedFeeToMaxFee(suggestedMaxFee, 1))
