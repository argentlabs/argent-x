import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { SwapQuoteResponseSchema } from "../../../../shared/swap/model/quote.model"

const SwapQuoteForPaySchema = z.object({
  payTokenAddress: z.string(),
  receiveTokenAddress: z.string(),
  payAmount: z.string(),
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
        payAmount,
        accountAddress,
      },
      ctx: {
        services: { swapService },
      },
    }) => {
      return swapService.getSwapQuoteForPay(
        payTokenAddress,
        receiveTokenAddress,
        payAmount,
        accountAddress,
      )
    },
  )
