import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { openSessionMiddleware } from "../../middleware/session"

const rejectOnChainTransactionSchema = z.object({
  requestId: z.string(),
})

export const rejectOnChainTransactionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(rejectOnChainTransactionSchema)
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.rejectOnChainTransaction(requestId)
    },
  )
