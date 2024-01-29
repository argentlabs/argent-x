import { BigNumber } from "@ethersproject/bignumber"

export const reviveJsonBigNumber = (_: string, value: unknown) => {
  if (typeof value === "object" && value !== null) {
    if (
      "type" in value &&
      value.type === "BigNumber" &&
      "hex" in value &&
      typeof value.hex === "string"
    ) {
      return BigNumber.from(value.hex)
    }
    if (
      "__type" in value &&
      value?.__type === "bigint" &&
      "value" in value &&
      typeof value.value === "string"
    ) {
      return BigInt(value.value)
    }
  }
  return value
}
