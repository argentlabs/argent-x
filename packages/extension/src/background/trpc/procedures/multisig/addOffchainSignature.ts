import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { multisigSignerSignaturesSchema } from "../../../../shared/multisig/multisig.model"

const addOffchainSignatureSchema = z.object({
  requestId: z.string(),
})

export const addOffchainSignatureProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addOffchainSignatureSchema)
  .output(multisigSignerSignaturesSchema)
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addOffchainSignature(requestId)
    },
  )
