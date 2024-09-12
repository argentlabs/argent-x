import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"

const cancelOffchainSignatureSchema = z.object({
  requestId: z.string(),
})

export const cancelOffchainSignatureProcedure = extensionOnlyProcedure
  .input(cancelOffchainSignatureSchema)
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.cancelOffchainSignature(requestId)
    },
  )
