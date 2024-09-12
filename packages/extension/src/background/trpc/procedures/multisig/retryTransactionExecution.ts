import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { openSessionMiddleware } from "../../middleware/session"

const retryTransactionExecutionSchema = z.object({
  requestId: z.string(),
})

export const retryTransactionExecutionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(retryTransactionExecutionSchema)
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.retryTransactionExecution(requestId)
    },
  )
