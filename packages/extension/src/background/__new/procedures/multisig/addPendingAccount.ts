import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const addPendingAccountSchema = z.object({
  networkId: z.string(),
})

export const addPendingAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addPendingAccountSchema)
  .mutation(
    async ({
      input: { networkId },
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addPendingAccount(networkId)
    },
  )
