import { addressSchema } from "@argent/shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"

const sendSchema = z.object({
  transactions: z.object({
    contractAddress: addressSchema,
    entrypoint: z.string(),
    calldata: z.string().array(),
  }),
})

export const sendProcedure = extensionOnlyProcedure
  .input(sendSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { transactions },
      ctx: {
        services: { actionService },
      },
    }) => {
      const { meta } = await actionService.add({
        type: "TRANSACTION",
        payload: {
          transactions,
        },
      })

      return meta.hash
    },
  )
