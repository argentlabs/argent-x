import { z } from "zod"
import {
  addressSchemaStrictLength,
  validChecksumAddressSchema,
  validateAddressRangeSchema,
} from "./address"
import { starknetIdSchema } from "./starknetId"

export const addressInputCharactersAndLengthSchema = z
  .string()
  .regex(/^[a-zA-Z0-9.-]*$/g, "Invalid address character")
  .max(66, "Address cannot be over 66 characters")

export const addressInputSchema = addressSchemaStrictLength
  .pipe(validChecksumAddressSchema)
  .pipe(validateAddressRangeSchema)

export const addressOrStarknetIdInputSchema = z.union([
  addressInputSchema,
  starknetIdSchema,
])

export type AddressOrStarknetIdInput = z.infer<
  typeof addressOrStarknetIdInputSchema
>
