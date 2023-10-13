import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const addTransactionSignatureSchema = z.object({
  requestId: z.string(),
})

export const addTransactionSignatureProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addTransactionSignatureSchema)
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addTransactionSignature(requestId)
    },
  )
