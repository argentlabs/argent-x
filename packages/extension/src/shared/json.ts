import { toBigInt } from "ethers"

export const reviveJsonBigNumber = (_: string, value: any) => {
  if (value?.type === "BigNumber" && "hex" in value) {
    return toBigInt(value.hex)
  }
  return value
}

export const serializeJsonBigNumber = (_: string, value: any) => {
  if (typeof value === "bigint") {
    return { type: "BigNumber", hex: value.toString(16) }
  }
  return value
}
