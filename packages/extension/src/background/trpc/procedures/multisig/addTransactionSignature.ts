import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const addTransactionSignatureSchema = z.object({
  requestId: z.string(),
  pubKey: z.string().optional(),
})

export const addTransactionSignatureProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addTransactionSignatureSchema)
  .mutation(
    async ({
      input: { requestId, pubKey },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addTransactionSignature(requestId, pubKey)
    },
  )
