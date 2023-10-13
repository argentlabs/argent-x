import { z } from "zod"

import { Address, addressSchema, normalizeAddress } from "./address"

/**
 * https://docs.starknet.id/for-devs/encoding-algorithm#the-basic-alphabet
 *
 * Max length is 'about' 48-49 characters - "any felt value represents a valid string"
 */
export const starknetIdSchema = z
  .string()
  .regex(/^([a-zA-Z0-9-]+\.)+stark$/, "Invalid Starknet ID")
  .max(50, "Starknet ID cannot be over 50 characters")

export type StarknetID = z.infer<typeof starknetIdSchema>

export const isStarknetId = (starknetId?: string): starknetId is StarknetID => {
  return starknetIdSchema.safeParse(starknetId).success
}

export const isEqualStarknetId = (a: string, b?: string) => {
  try {
    if (!b) {
      return false
    }
    return normalizeStarknetId(a) === normalizeStarknetId(b)
  } catch {
    // ignore parsing error
  }
  return false
}

export const normalizeStarknetId = (starknetId: StarknetID) => {
  return starknetIdSchema.parse(starknetId).toLowerCase()
}

export const normalizeAddressOrStarknetId = (
  addressOrStarknetId: Address | StarknetID,
) => {
  if (isStarknetId(addressOrStarknetId)) {
    return normalizeStarknetId(addressOrStarknetId)
  }
  return normalizeAddress(addressOrStarknetId)
}

export const addressOrStarknetIdSchema = z.union([
  addressSchema,
  starknetIdSchema,
])

export type AddressOrStarknetId = z.infer<typeof addressOrStarknetIdSchema>
