import { encode } from "starknet"

export const isValidAddress = (address: string): boolean =>
  /^0x[0-9a-f]{1,64}$/.test(address)

export const normalizeAddress = (address: string) =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const formatTruncatedAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const start = normalized.slice(2, 6)
  const end = normalized.slice(-4)
  return `${hex} ${start} ... ${end}`
}

export const formatFullAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const rest = normalized.slice(2)
  const parts = rest.match(/.{1,4}/g) || []
  return `${hex} ${parts.join(" ")}`
}
