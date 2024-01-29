import {
  constants,
  getChecksumAddress,
  num,
  validateAndParseAddress,
  validateChecksumAddress,
} from "starknet"
import { z } from "zod"

import { Hex } from "../../utils/hex"
import { memoize } from "lodash-es"

export type TxHash = Hex
export type Address = Hex

export const validChecksumAddressSchema = z.string().refine((value) => {
  // if contains capital letters, make sure to check checksum
  if (value.toLowerCase() === value) {
    return true
  }
  try {
    return validateChecksumAddress(value) && isChecksumAddress(value)
  } catch {
    // ignore validation error
  }
  return false
}, "Invalid address (checksum error)")

export const validateAddressRangeSchema = z.string().refine((value) => {
  // check the address is actually within range (part of validateAndParseAddress check)
  try {
    return validateAndParseAddress(value)
  } catch {
    // ignore validation error
  }
  return false
}, "Invalid address (validation error)")

export const addressSchemaBase = z
  .string()
  .regex(/^0x[0-9a-fA-F]+$/, "Invalid address")

export const addressSchemaLooseLength = addressSchemaBase
  .min(50, "Addresses must at least be 50 characters long")
  .max(66, "Addresses must at most be 66 characters long")

export const addressSchemaStrictLength = addressSchemaBase.length(
  66,
  "Address must be 66 characters long",
)

export const addressSchema = addressSchemaLooseLength
  .pipe(validChecksumAddressSchema)
  .transform<Address>((value) => {
    // remove 0x prefix
    const withoutPrefix = value.startsWith("0x") ? value.slice(2) : value
    // pad left until length is 64
    const padded = withoutPrefix.padStart(64, "0")
    // add 0x prefix
    return `0x${padded}`
  })

export const addressOrEmptyUndefinedSchema = addressSchema
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v))
  .optional()

export const addressSchemaArgentBackend = addressSchemaBase.transform(
  (value) => {
    // 0 padded, 0x prefixed, lowercase hex with a length of 66
    const withoutPrefix = value.replace(/^0x/, "")
    const paddedLowercase = withoutPrefix.toLowerCase().padStart(64, "0")
    return `0x${paddedLowercase}` as Address
  },
)

export const isAddress = (string?: string): string is Address =>
  addressSchema.safeParse(string).success

export const isValidAddress = isAddress

export const normalizeAddress = (address: string) =>
  getChecksumAddress(address) as Address

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

export const isEqualAddress = (a: string, b?: string) => {
  try {
    if (!b) {
      return false
    }
    return num.hexToDecimalString(a) === num.hexToDecimalString(b)
  } catch {
    // ignore parsing error
  }
  return false
}

export const isZeroAddress = (address: string) => {
  try {
    const isZero =
      num.toBigInt(addressSchemaBase.parse(address)) === constants.ZERO
    return isZero
  } catch {
    // ignore parsing error
  }
  return false
}

export const includesAddress = (needle: string, haystack?: string[]) => {
  return Boolean(haystack?.some((value) => isEqualAddress(value, needle)))
}

export const formatTruncatedSignerKey = memoize((signerKey: string) => {
  const start = signerKey.slice(0, 6)
  const end = signerKey.slice(-4)
  return `${start}…${end}`
})

export const formatTruncatedString = memoize(
  (string: string, targetLength: number) => {
    if (string.length < targetLength) {
      return string
    }

    const startEndLength = Math.floor((targetLength - 1) / 2)
    const start = string.slice(0, startEndLength)
    const end = string.slice(-startEndLength)

    return `${start}…${end}`
  },
)
