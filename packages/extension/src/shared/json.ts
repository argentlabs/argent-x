import { BigNumber } from "ethers"

export const reviveJsonBigNumber = (_: string, value: any) => {
  if (value?.type === "BigNumber" && "hex" in value) {
    return BigNumber.from(value.hex)
  }
  return value
}
