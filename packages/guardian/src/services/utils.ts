import { V3InvocationsSignerDetails, num } from "starknet"

export function isV3Details<T extends { version: string }>(
  details: T,
): details is T & Pick<V3InvocationsSignerDetails, "version"> {
  return (
    details.version === "0x3" ||
    details.version === "0x100000000000000000000000000000003"
  )
}

type RESOURCE_BOUNDS = {
  max_amount: string
  max_price_per_unit: string
}
export function mapResourceBoundsToBackendBounds(bounds: RESOURCE_BOUNDS): {
  max_amount: number
  max_price_per_unit: number
} {
  return {
    max_amount: Number(num.toBigInt(bounds.max_amount).toString(10)),
    max_price_per_unit: Number(
      num.toBigInt(bounds.max_price_per_unit).toString(10),
    ),
  }
}
