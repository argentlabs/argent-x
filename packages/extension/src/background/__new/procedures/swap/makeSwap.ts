import { callSchema } from "@argent/shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"

export const swapSchema = z.object({
  transactions: z.union([callSchema, z.array(callSchema)]),
  title: z.string(),
})

export const makeSwapProcedure = extensionOnlyProcedure
  .input(swapSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions, title },
      ctx: {
        services: { actionService },
      },
    }) => {
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: {
            transactions,
          },
        },
        {
          title,
          icon: "SwapIcon",
        },
      )

      return meta.hash
    },
  )
