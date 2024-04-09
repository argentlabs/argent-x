import { addressSchema } from "@argent/x-shared"
import { z } from "zod"
import { SwapDataSchema } from "./quote.model"
import { CallSchema } from "@argent/x-window"

export const SwapOrderRequestSchema = z.object({
  chain: z.literal("starknet"),
  sellToken: addressSchema,
  buyToken: addressSchema,
  sellAmount: z.string(),
  buyAmount: z.string(),
  accountAddress: addressSchema,
  slippage: z.number().transform((v) => v.toString()),
  data: SwapDataSchema,
})

export type SwapOrderRequest = z.infer<typeof SwapOrderRequestSchema>

export const SwapOrderResponseSchema = z.object({
  calls: z.array(CallSchema),
})

export type SwapOrderResponse = z.infer<typeof SwapOrderResponseSchema>
