import { addressSchema } from "@argent/shared"
import { z } from "zod"

export const SwapDataSchema = z.object({
  quoteId: z.string(),
})

export const SwapQuoteRouteSchema: z.ZodSchema<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    percent: z.number(),
    sellToken: addressSchema,
    buyToken: addressSchema,
    routes: z.array(SwapQuoteRouteSchema),
  }),
)

export type SwapQuoteRoute = z.infer<typeof SwapQuoteRouteSchema>

export const SwapQuoteResponseSchema = z.object({
  sellToken: addressSchema,
  sellAmount: z.string(),
  sellAmountInCurrency: z.string(),
  buyToken: addressSchema,
  buyAmount: z.string(),
  buyAmountInCurrency: z.string(),
  expiresAt: z.number(),
  expiresIn: z.number(),
  dexCount: z.number(),
  routes: z.array(SwapQuoteRouteSchema),
  providerName: z.string(),
  providerFee: z.string(),
  providerFeeInCurrency: z.string(),
  providerFeePercentage: z.number(),
  argentFee: z.string(),
  argentFeeInCurrency: z.string(),
  argentFeePercentage: z.number(),
  feeToken: addressSchema,
  data: SwapDataSchema,
})

export type SwapQuoteResponse = z.infer<typeof SwapQuoteResponseSchema>
