import { router } from "../../trpc"
import { getSwapQuoteForPayProcedure } from "./getSwapQuoteForPay"
import { getSwapTradeFromQuoteProcedure } from "./getSwapTradeFromQuote"
import { getSwapOrderFromTradeProcedure } from "./getSwapOrderFromTrade"
import { makeSwapProcedure } from "./makeSwap"

export const swapRouter = router({
  getSwapQuoteForPay: getSwapQuoteForPayProcedure,
  getSwapTradeFromQuote: getSwapTradeFromQuoteProcedure,
  getSwapOrderFromTrade: getSwapOrderFromTradeProcedure,
  makeSwap: makeSwapProcedure,
})
