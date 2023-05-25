import { validateChecksumAddress } from "starknet5"
import { z } from "zod"

import { Hex } from "./hex"

type Address = Hex

export const addressSchemaBase = z
  .string()
  .regex(/^0x[0-9a-fA-F]+$/, "Invalid address")
  .min(50, "Addresses must at least be 50 characters long")
  .max(66, "Addresses must at most be 66 characters long")

export const addressSchema = addressSchemaBase
  .refine((value) => {
    // if contains capital letters, make sure to check checksum
    return value.toLowerCase() === value || validateChecksumAddress(value)
  }, "Invalid address (checksum error)")
  .transform<Address>((value) => {
    // remove 0x prefix
    const withoutPrefix = value.startsWith("0x") ? value.slice(2) : value
    // pad left until length is 64
    const padded = withoutPrefix.padStart(64, "0")
    // add 0x prefix
    return `0x${padded}`
  })
