import { z } from "zod"
import {
  addressSchemaStrictLength,
  validChecksumAddressSchema,
  validateAddressRangeSchema,
} from "./address"

export const addressInputCharactersAndLengthSchema = z
  .string()
  .regex(/^[a-zA-Z0-9.-]*$/g, "Invalid address character")
  .max(66, "Address cannot be over 66 characters")

export const addressInputSchema = addressSchemaStrictLength
  .pipe(validChecksumAddressSchema)
  .pipe(validateAddressRangeSchema)
