import { num } from "starknet"
import { ResourceBounds } from "@starknet-io/types-js"
import { ApiMultisigResourceBounds } from "../multisig.model"

const DEFAULT_BOUNDS = {
  max_amount: "0x0",
  max_price_per_unit: "0x0",
}

const convertBoundsToHex = (bounds: {
  max_amount: string
  max_price_per_unit: string
}) => {
  return {
    max_amount: num.toHex(bounds.max_amount),
    max_price_per_unit: num.toHex(bounds.max_price_per_unit),
  }
}

export const mapResourceBoundsToStrkBounds = (
  bounds?: ApiMultisigResourceBounds,
): ResourceBounds => {
  // Use the default bounds if no bounds are provided
  if (!bounds) {
    return {
      l1_gas: DEFAULT_BOUNDS,
      l2_gas: DEFAULT_BOUNDS,
    }
  }
  return {
    l1_gas: convertBoundsToHex(bounds.l1_gas),
    l2_gas: convertBoundsToHex(bounds.l2_gas),
  }
}
