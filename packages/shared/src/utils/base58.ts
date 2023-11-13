import { base58, hex } from "@scure/base"
import { BigNumberish, encode, num } from "starknet"

export const encodeBase58 = (val: BigNumberish) => {
  const hexValue = encode.removeHexPrefix(encode.sanitizeHex(num.toHex(val)))
  const bytesValue = hex.decode(hexValue)
  return base58.encode(bytesValue)
}

export const encodeBase58Array = (arr: BigNumberish[]) => {
  return arr.map(encodeBase58)
}

export const decodeBase58 = (val: string) => {
  const bytesValue = base58.decode(val)
  const hexValue = encode.sanitizeHex(hex.encode(bytesValue))
  return hexValue
}

export const decodeBase58Array = (arr: string[]) => {
  return arr.map(decodeBase58)
}
