import { addressSchema } from "@argent/shared"
import { z } from "zod"

export const BaseTokenSchema = z.object(
  {
    address: addressSchema,
    networkId: z.string({ required_error: "Network is required" }),
  },
  { required_error: "BaseToken is required" },
)

export type BaseToken = z.infer<typeof BaseTokenSchema>

export const RequestTokenSchema = z.object({
  address: addressSchema,
  networkId: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.coerce.number().optional(),
})

export type RequestToken = z.infer<typeof RequestTokenSchema>

/**
 * @deprecated use new schema instead
 */
export const TokenSchema = RequestTokenSchema.required().extend({
  image: z.string().optional(),
  showAlways: z.boolean().optional(),
})

/**
 * @deprecated use new interface instead
 */
export type Token = z.infer<typeof TokenSchema>
