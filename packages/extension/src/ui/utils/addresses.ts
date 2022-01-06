import { encode } from "starknet"

export const isValidAddress = (address: string): boolean =>
  /^0x[0-9a-f]{64}$/.test(address)

export const formatAddress = (address: string) =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const truncateAddress = (address: string) => {
  const formattedAddress = formatAddress(address)

  return `${formattedAddress.slice(0, 2)} ${formattedAddress.slice(
    2,
    6,
  )} ... ${formattedAddress.slice(-4)}`
}
