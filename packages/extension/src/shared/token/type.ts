import { z } from "zod"

export const BaseTokenSchema = z.object(
  {
    address: z.string({ required_error: "Address is required" }),
    networkId: z.string({ required_error: "Network is required" }),
  },
  { required_error: "BaseToken is required" },
)

export type BaseToken = z.infer<typeof BaseTokenSchema>

export const RequestTokenSchema = z.object({
  address: z.string(),
  networkId: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})

export type RequestToken = z.infer<typeof RequestTokenSchema>

export const TokenSchema = RequestTokenSchema.required().extend({
  image: z.string().optional(),
  showAlways: z.boolean().optional(),
})

export type Token = z.infer<typeof TokenSchema>
