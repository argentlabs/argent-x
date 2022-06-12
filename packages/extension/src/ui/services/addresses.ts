import {
  constants,
  getChecksumAddress,
  number,
  validateAndParseAddress,
  validateChecksumAddress,
} from "starknet"
import * as yup from "yup"

const validAddressRegex = /^0x[0-9a-fA-F]{63,64}$/

export const normalizeAddress = (address: string) => getChecksumAddress(address)

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

const isChecksumAddress = (address: string) => {
  if (/^0x[0-9a-f]{63,64}$/.test(address)) {
    return false
  }
  return true
}

export const addressSchema = yup
  .string()
  .trim()
  .required()
  .test("isValidAddress", "Invalid address", (address?: string) => {
    if (!address) {
      return new yup.ValidationError("Address is required")
    }
    if (!validAddressRegex.test(address)) {
      return new yup.ValidationError("Address should be hexadecimal")
    }
    try {
      const parsedAddress = validateAndParseAddress(address)
      if (number.toBN(parsedAddress).eq(constants.ZERO)) {
        return new yup.ValidationError("Zero address not allowed")
      }
    } catch {
      return new yup.ValidationError("Invalid address")
    }
    if (isChecksumAddress(address) && !validateChecksumAddress(address)) {
      return new yup.ValidationError("Invalid checksum address")
    }

    return true
  })

export const isValidAddress = (address: string) =>
  addressSchema.isValidSync(address)
