import { num } from "starknet"

/**
 *
 * This method calculate the max fee for argent. Argent keeps the 1.5x overhead to the fee.
 *
 * @param suggestedMaxFee: fee calculated in starknetjs with the formula: overall_fee * 1.5
 * @returns argentMaxFee: currently equal to suggestedMaxFee
 *
 *  */
export const argentMaxFee = (suggestedMaxFee: num.BigNumberish) =>
  num.toHex(suggestedMaxFee)
