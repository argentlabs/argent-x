import { addressSchema } from "@argent/x-shared"
import { z } from "zod"

// NOTE: these deprecated types are currently used by `runV59TokenMigration`

/**
 * @deprecated use new schema instead
 */
export const BaseTokenSchema = z.object(
  {
    address: addressSchema,
    networkId: z.string({ required_error: "Network is required" }),
  },
  { required_error: "BaseToken is required" },
)

/**
 * @deprecated use new schema instead
 */
export type BaseToken = z.infer<typeof BaseTokenSchema>

const RequestTokenSchema = z.object({
  address: addressSchema,
  networkId: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.coerce.number().optional(),
})

const TokenSchema = RequestTokenSchema.required().extend({
  image: z.string().optional(),
  showAlways: z.boolean().optional(),
})

/**
 * @deprecated use new interface instead
 */
export type Token = z.infer<typeof TokenSchema>
