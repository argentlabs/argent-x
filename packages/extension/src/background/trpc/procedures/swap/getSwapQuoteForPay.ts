import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { SwapQuoteResponseSchema } from "../../../../shared/swap/model/quote.model"

const SwapQuoteForPaySchema = z.object({
  payTokenAddress: z.string(),
  receiveTokenAddress: z.string(),
  sellAmount: z.string().optional(),
  buyAmount: z.string().optional(),
  accountAddress: z.string(),
})

export const getSwapQuoteForPayProcedure = extensionOnlyProcedure
  .input(SwapQuoteForPaySchema)
  .output(SwapQuoteResponseSchema)
  .query(
    ({
      input: {
        payTokenAddress,
        receiveTokenAddress,
        sellAmount,
        buyAmount,
        accountAddress,
      },
      ctx: {
        services: { swapService },
      },
    }) => {
      return swapService.getSwapQuoteForPay(
        payTokenAddress,
        receiveTokenAddress,
        accountAddress,
        sellAmount,
        buyAmount,
      )
    },
  )
