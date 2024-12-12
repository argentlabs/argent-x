import { addressSchema } from "@argent/x-shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"

const sendSchema = z.object({
  transactions: z.object({
    contractAddress: addressSchema,
    entrypoint: z.string(),
    calldata: z.string().array(),
  }),
  title: z.string(),
  shortTitle: z.string().optional(),
  subtitle: z.string().optional(),
  isMaxSend: z.boolean().optional(),
})

export const sendProcedure = extensionOnlyProcedure
  .input(sendSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions, title, shortTitle, subtitle, isMaxSend },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      const selectedaccount = await wallet.getSelectedAccount()
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: {
            transactions,
            meta: {
              isMaxSend,
              ampliProperties: {
                "is deployment": false,
                "transaction type": "inapp send",
                "account type": sanitizeAccountType(selectedaccount?.type),
                "account index": selectedaccount?.index,
                "token addresses": [transactions.contractAddress],
                "wallet platform": "browser extension",
              },
            },
          },
        },
        {
          title,
          shortTitle,
          subtitle,
          icon: "SendSecondaryIcon",
        },
      )

      return meta.hash
    },
  )
