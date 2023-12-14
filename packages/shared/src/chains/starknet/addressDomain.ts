import { z } from "zod"

import { addressSchema, normalizeAddress } from "./address"
import {
  argentNameSchema,
  isArgentName,
  isEqualArgentName,
  normalizeArgentName,
} from "./argentName"
import {
  isEqualStarknetId,
  isStarknetId,
  normalizeStarknetId,
  starknetIdSchema,
} from "./starknetId"
import { addressInputSchema } from "./addressInput"

export const starknetDomainNameSchema = z.union([
  argentNameSchema,
  starknetIdSchema,
])

export type StarknetDomainName = z.infer<typeof starknetDomainNameSchema>

export const addressOrDomainSchema = z.union([
  addressSchema,
  starknetDomainNameSchema,
])

export type AddressOrDomain = z.infer<typeof addressOrDomainSchema>

export const addressOrDomainInputSchema = z.union([
  addressInputSchema,
  starknetDomainNameSchema,
])

export type AddressOrDomainInput = z.infer<typeof addressOrDomainInputSchema>

export const isStarknetDomainName = (
  addressOrDomain?: AddressOrDomain,
): addressOrDomain is StarknetDomainName => {
  return starknetDomainNameSchema.safeParse(addressOrDomain).success
}

export const isEqualStarknetDomainName = (
  a: StarknetDomainName,
  b?: StarknetDomainName,
): boolean => {
  try {
    if (!b) {
      return false
    }
    return isEqualArgentName(a, b) || isEqualStarknetId(a, b)
  } catch {
    // ignore parsing error
  }
  return false
}

export const normalizeAddressOrDomain = (addressOrDomain: AddressOrDomain) => {
  if (isStarknetId(addressOrDomain)) {
    return normalizeStarknetId(addressOrDomain)
  }
  if (isArgentName(addressOrDomain)) {
    return normalizeArgentName(addressOrDomain)
  }
  return normalizeAddress(addressOrDomain)
}
