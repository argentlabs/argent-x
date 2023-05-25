import { memoize } from "lodash-es"
import {
  constants,
  getChecksumAddress,
  number,
  validateAndParseAddress,
  validateChecksumAddress,
} from "starknet"
import * as yup from "yup"

export const normalizeAddress = (address: string) => getChecksumAddress(address)

export const formatTruncatedSignerKey = memoize((signerKey: string) => {
  const start = signerKey.slice(0, 6)
  const end = signerKey.slice(-4)
  return `${start}…${end}`
})

export const formatTruncatedAddress = memoize((address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const start = normalized.slice(2, 6)
  const end = normalized.slice(-4)
  return `${hex}${start}…${end}`
})

export const formatFullAddress = memoize((address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const rest = normalized.slice(2)
  const parts = rest.match(/.{1,4}/g) || []
  return `${hex} ${parts.join(" ")}`
})

const isChecksumAddress = memoize((address: string) => {
  if (/^0x[0-9a-f]{63,64}$/.test(address)) {
    return false
  }
  return true
})

export const isStarknetId = (address: string) => {
  const starkNetIdRegex = /^[a-zA-Z0-9]+\.stark$/
  return starkNetIdRegex.test(address)
}

export const isStarknetId = (address: string) => {
  const starkNetIdRegex = /^[a-zA-Z0-9]+\.stark$/
  return starkNetIdRegex.test(address)
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
      if (isStarknetId(address)) {
        // If the StarknetId is not resolved to any address, it's an error
        return ctx.createError({ message: "Starknet ID does not exist" })
      }

      if (!/^0x[0-9a-fA-F]+$/.test(address) && !isStarknetId(address)) {
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
