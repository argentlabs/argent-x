import {
  constants,
  getChecksumAddress,
  number,
  validateAndParseAddress,
  validateChecksumAddress,
} from "starknet"
import * as yup from "yup"

export const normalizeAddress = (address: string) => getChecksumAddress(address)

export const formatTruncatedAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const start = normalized.slice(2, 6)
  const end = normalized.slice(-4)
  return `${hex}${start}…${end}`
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
  .required("Address is required")
  .test((address, ctx) => {
    if (!address) {
      return ctx.createError({ message: "Address is required" })
    }
    try {
      if (!/^0x[0-9a-fA-F]+$/.test(address)) {
        return ctx.createError({ message: "Address should be hexadecimal" })
      }

      if (!/^0x[0-9a-fA-F]{63,64}$/.test(address)) {
        return ctx.createError({
          message: "Address should be between 63 and 64 characters long",
        })
      }

      const parsedAddress = validateAndParseAddress(address)
      if (number.toBN(parsedAddress).eq(constants.ZERO)) {
        return ctx.createError({ message: "Zero address not allowed" })
      }

      if (isChecksumAddress(address) && !validateChecksumAddress(address)) {
        return ctx.createError({ message: "Invalid checksum address" })
      }
    } catch {
      return ctx.createError({ message: "Invalid address" })
    }

    return true
  })

export const isValidAddress = (address: string) =>
  addressSchema.isValidSync(address)

export const isEqualAddress = (a: string, b?: string) => {
  try {
    if (!b) {
      return false
    }
    return number.hexToDecimalString(a) === number.hexToDecimalString(b)
  } catch {
    // ignore parsing error
  }
  return false
}
