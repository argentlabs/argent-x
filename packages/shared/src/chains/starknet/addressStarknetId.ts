import { z } from "zod"

import { addressSchema } from "./address"
import { starknetIdSchema } from "./starknetId"

export const addressOrStarknetIdSchema = z.union([
  addressSchema,
  starknetIdSchema,
])

export type AddressOrStarknetId = z.infer<typeof addressOrStarknetIdSchema>
