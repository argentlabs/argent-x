import { addressSchema, callSchema } from "@argent/x-shared"
import { z } from "zod"

import { swapReviewTradeSchema } from "../../../../shared/swap/model/trade.model"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"
import { extensionOnlyProcedure } from "../permissions"

export const swapSchema = z.object({
  transactions: z.union([callSchema, z.array(callSchema)]),
  title: z.string(),
  tokenAddresses: z.tuple([addressSchema, addressSchema]),
  reviewTrade: swapReviewTradeSchema,
})

export const makeSwapProcedure = extensionOnlyProcedure
  .input(swapSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions, title, tokenAddresses, reviewTrade },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      const selectedAccount = await wallet.getSelectedAccount()
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: {
            transactions,
            meta: {
              ampliProperties: {
                "is deployment": false,
                "transaction type": "inapp swap",
                "account type": sanitizeAccountType(selectedAccount?.type),
                "account index": selectedAccount?.index,
                "token addresses": tokenAddresses,
                "wallet platform": "browser extension",
                "base token": reviewTrade.baseToken.symbol,
                "quote token": reviewTrade.quoteToken.symbol,
                slippage: reviewTrade.slippage / 100,
                "token pair": `${reviewTrade.baseToken.symbol}/${reviewTrade.quoteToken.symbol}`,
              },
              reviewTrade,
            },
          },
        },
        {
          title,
          shortTitle: "Swap",
          icon: "SwapPrimaryIcon",
        },
      )

      return meta.hash
    },
  )
