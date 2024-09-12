import { addressSchema } from "@argent/x-shared"
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

export const TokenSchema = RequestTokenSchema.required().extend({
  id: z.number().optional(),
  iconUrl: z.string().optional(),
  showAlways: z.boolean().optional(),
  popular: z.boolean().optional(),
  custom: z.boolean().optional(),
  pricingId: z.number().optional(),
  tradable: z.boolean().optional(),
  tags: z.string().array().optional(),
})

export type Token = z.infer<typeof TokenSchema>
