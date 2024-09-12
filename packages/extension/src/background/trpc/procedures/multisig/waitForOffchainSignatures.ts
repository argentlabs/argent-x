import { z } from "zod"
import { connectedDappsProcedure } from "../permissions"

const waitForOffchainSignatureSchema = z.object({
  requestId: z.string(),
})

export const waitForOffchainSignaturesProcedure = connectedDappsProcedure
  .input(waitForOffchainSignatureSchema)
  .output(z.array(z.string()))
  .mutation(
    async ({
      input: { requestId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.waitForOffchainSignatures(requestId)
    },
  )
