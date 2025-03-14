import { z } from "zod"
import { SwapQuoteRouteSchema, SwapDataSchema } from "./quote.model"
import { TokenSchema } from "../../token/__new/types/token.model"

export enum TradeType {
  EXACT_PAY = "EXACT_PAY",
  EXACT_RECEIVE = "EXACT_RECEIVE",
}

export const TradeTypeSchema = z.nativeEnum(TradeType)

export const TradeSchema = z.object({
  payToken: TokenSchema,
  receiveToken: TokenSchema,
  tradeType: TradeTypeSchema.default(TradeType.EXACT_PAY),
  payAmount: z.string(),
  receiveAmount: z.string(),
  payAmountInCurrency: z.string(),
  receiveAmountInCurrency: z.string(),
  totalFee: z.string(),
  totalFeeInCurrency: z.string().optional(),
  totalFeePercentage: z.number(),
  expiresAt: z.number(),
  expiresIn: z.number(),
  route: SwapQuoteRouteSchema,
  data: SwapDataSchema,
})

export type Trade = z.infer<typeof TradeSchema>

export type TradeAmounts = Pick<Trade, "payAmount" | "receiveAmount">

export const baseTradeProviderSchema = z.object({
  name: z.string(),
  iconUrl: z.string().optional(),
})

export type BaseTradeProvider = z.infer<typeof baseTradeProviderSchema>

const priceImpactResultSchema = z.object({
  value: z.number(),
  type: z.enum(["low", "high", "extreme"]),
})

export type PriceImpactResult = z.infer<typeof priceImpactResultSchema>

export const swapReviewTradeSchema = z.object({
  providers: z.array(baseTradeProviderSchema),
  executionPrice: z.string(),
  priceImpact: priceImpactResultSchema.optional(),
  slippage: z.number(),
  totalFeePercentage: z.number(),
  baseToken: TokenSchema,
  quoteToken: TokenSchema,
})

export type SwapReviewTrade = z.infer<typeof swapReviewTradeSchema>
