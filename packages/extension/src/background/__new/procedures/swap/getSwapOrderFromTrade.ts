import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { SwapOrderResponseSchema } from "../../../../shared/swap/model/order.model"
import { TradeSchema } from "../../../../shared/swap/model/trade.model"
import { addressSchema } from "@argent/shared"

const SwapOrderFromTradeSchema = z.object({
  trade: TradeSchema,
  accountAddress: addressSchema,
  userSlippageTolerance: z.number(),
})

export const getSwapOrderFromTradeProcedure = extensionOnlyProcedure
  .input(SwapOrderFromTradeSchema)
  .output(SwapOrderResponseSchema)
  .mutation(
    ({
      input: { trade, accountAddress, userSlippageTolerance },
      ctx: {
        services: { swapService },
      },
    }) => {
      return swapService.getSwapOrderFromTrade(
        accountAddress,
        trade,
        userSlippageTolerance,
      )
    },
  )
