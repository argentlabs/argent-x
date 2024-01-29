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
