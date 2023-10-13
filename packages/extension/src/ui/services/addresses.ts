import { memoize } from "lodash-es"
import { getChecksumAddress, num } from "starknet"

// TODO remove this file and use the shared one

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
