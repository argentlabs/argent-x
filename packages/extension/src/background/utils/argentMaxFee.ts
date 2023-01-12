import { number, stark } from "starknet"

/**
 *
 * This method calculate the max fee for argent. Argent adds a 3x overhead to the fee.
 *
 * @param suggestedMaxFee: fee calculated in starknetjs with the formula: overall_fee * 1.5
 * @returns argentMaxFee: fee calculated by argent x overhead. argentMaxFee = suggestedMaxFee * 2 = overall_fee * 3
 *
 *  */
export const argentMaxFee = (suggestedMaxFee: number.BigNumberish) =>
  number.toHex(stark.estimatedFeeToMaxFee(suggestedMaxFee, 1))
