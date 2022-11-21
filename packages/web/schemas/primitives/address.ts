import { validateAndParseAddress, validateChecksumAddress } from "starknet"
import * as zod from "zod"

export const addressSchema = zod
  .string()
  .min(62, "Address must be at least 62 characters long")
  .max(66, "Address must be at most 66 characters long")
  .refine(
    (value) => {
      try {
        validateAndParseAddress(value)
        // if address contains at least one uppercase letter, it must be a checksum address
        if (value.match(/[A-Z]/)) {
          return validateChecksumAddress(value)
        }
        return true
      } catch (e) {
        return false
      }
    },
    {
      message: "Invalid address",
    },
  )
