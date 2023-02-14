import { toBigInt } from "ethers"

export const reviveJsonBigNumber = (_: string, value: any) => {
  if (value?.type === "BigNumber" && "hex" in value) {
    return toBigInt(value.hex)
  }
  return value
}
