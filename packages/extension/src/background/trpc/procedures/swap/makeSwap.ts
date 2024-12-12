import { addressSchema, callSchema } from "@argent/x-shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"

export const swapSchema = z.object({
  transactions: z.union([callSchema, z.array(callSchema)]),
  title: z.string(),
  tokenAddresses: z.tuple([addressSchema, addressSchema]),
})

export const makeSwapProcedure = extensionOnlyProcedure
  .input(swapSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions, title, tokenAddresses },
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
              },
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
