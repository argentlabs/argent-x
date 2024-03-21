import { addressSchema } from "@argent/x-shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"

const sendSchema = z.object({
  transactions: z.object({
    contractAddress: addressSchema,
    entrypoint: z.string(),
    calldata: z.string().array(),
  }),
  title: z.string(),
  subtitle: z.string().optional(),
  isMaxSend: z.boolean().optional(),
})

export const sendProcedure = extensionOnlyProcedure
  .input(sendSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions, title, subtitle, isMaxSend },
      ctx: {
        services: { actionService },
      },
    }) => {
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: {
            transactions,
            meta: {
              isMaxSend,
            },
          },
        },
        {
          title,
          subtitle,
          icon: "SendIcon",
        },
      )

      return meta.hash
    },
  )
