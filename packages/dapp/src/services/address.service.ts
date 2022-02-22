import { encode } from "starknet"

export const formatAddress = (address: string) =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const truncateAddress = (fullAddress: string) => {
  const address = formatAddress(fullAddress)

  const hex = address.slice(0, 2)
  const start = address.slice(2, 6)
  const end = address.slice(-4)
  return `${hex} ${start} ... ${end}`
}
