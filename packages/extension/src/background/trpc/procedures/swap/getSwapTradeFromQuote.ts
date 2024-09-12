import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { TradeSchema } from "../../../../shared/swap/model/trade.model"
import { SwapQuoteResponseSchema } from "../../../../shared/swap/model/quote.model"

const SwapQuoteResponseWithNetworkSchema = z.object({
  quote: SwapQuoteResponseSchema,
  networkId: z.string(),
})

export const getSwapTradeFromQuoteProcedure = extensionOnlyProcedure
  .input(SwapQuoteResponseWithNetworkSchema)
  .output(TradeSchema)
  .query(
    async ({
      input: { quote, networkId },
      ctx: {
        services: { swapService },
      },
    }) => {
      return await swapService.getSwapTradeFromQuote(quote, networkId)
    },
  )
