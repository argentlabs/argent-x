import { z } from "zod"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { recoveredLedgerMultisigSchema } from "../../../../shared/wallet.model"

const restoreMultisigInputSchema = z.object({
  networkId: z.string(),
})

export const restoreMultisigProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(restoreMultisigInputSchema)
  .output(z.array(recoveredLedgerMultisigSchema))
  .mutation(
    async ({
      ctx: {
        services: { wallet },
      },
      input: { networkId },
    }) => {
      return wallet.restoreMultisigAccountsFromLedger(networkId)
    },
  )
