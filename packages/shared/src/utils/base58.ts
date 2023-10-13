import { utils } from "ethers"
import { BigNumberish, encode, num } from "starknet"

export const encodeBase58 = (val: BigNumberish) => {
  const bytes = encode.sanitizeHex(num.toHex(val))
  const base58 = utils.base58.encode(bytes)
  return base58
}

export const encodeBase58Array = (arr: BigNumberish[]) => {
  return arr.map(encodeBase58)
}

export const decodeBase58 = (val: string) => {
  const bytes = utils.base58.decode(val)
  const hex = encode.sanitizeHex(utils.hexlify(bytes))
  return hex
}

export const decodeBase58Array = (arr: string[]) => {
  return arr.map(decodeBase58)
}
