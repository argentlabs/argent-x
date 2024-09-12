import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { signerTypeSchema } from "../../../../shared/wallet.model"

const addPendingAccountSchema = z.object({
  networkId: z.string(),
  signerType: signerTypeSchema,
})

export const addPendingAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addPendingAccountSchema)
  .mutation(
    async ({
      input: { networkId, signerType },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addPendingAccount(networkId, signerType)
    },
  )
