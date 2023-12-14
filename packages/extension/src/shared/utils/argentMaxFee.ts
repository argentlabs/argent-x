import { num } from "starknet"

// this is used as a default overhead to have a 2x overhead to the fee
const DEFAULT_OVERHEAD = 2
export const FEE_OVERHEAD = process.env.FEE_OVERHEAD
  ? parseFloat(process.env.FEE_OVERHEAD)
  : DEFAULT_OVERHEAD

const SN_JS_DEFAULT_MULTIPLIER = 1.5
const scale = 10

/**
 * Calculate the max fee with an overhead multiplier.
 *
 * @param suggestedMaxFee: fee calculated in starknetjs
 * @param overheadMultiplier: the multiplier to apply as overhead (default to 1.5)
 * @returns: the maximum fee considering the overhead
 */
export const argentMaxFee = ({
  suggestedMaxFee,
  overheadMultiplier = FEE_OVERHEAD,
  starknetJsOverheadMultiplier = SN_JS_DEFAULT_MULTIPLIER,
}: {
  suggestedMaxFee: num.BigNumberish
  overheadMultiplier?: number
  starknetJsOverheadMultiplier?: number
}) => {
  // Convert suggestedMaxFee to BigInt for calculation
  const suggestedMaxFeeBigInt = num.toBigInt(suggestedMaxFee)
  // We remove the overhead from starknetjs
  const estimatedFee =
    (suggestedMaxFeeBigInt * BigInt(scale)) /
    BigInt(starknetJsOverheadMultiplier * scale)

  // Apply the overhead multiplier
  const maxFeeWithOverhead =
    (estimatedFee * BigInt(overheadMultiplier * scale)) / BigInt(scale)

  // Convert the result back to hex
  return num.toHex(maxFeeWithOverhead)
}
