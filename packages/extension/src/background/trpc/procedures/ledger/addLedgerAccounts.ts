import { z } from "zod"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import {
  importedLedgerAccountSchema,
  walletAccountSchema,
} from "../../../../shared/wallet.model"

const addLedgerAccountsSchema = z.object({
  importedLedgerAccounts: z.array(importedLedgerAccountSchema),
  networkId: z.string(),
})

export const addLedgerAccountsProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addLedgerAccountsSchema)
  .output(z.array(walletAccountSchema))
  .mutation(
    async ({
      input: { importedLedgerAccounts, networkId },
      ctx: {
        services: { wallet },
      },
    }) => {
      return await wallet.addLedgerAccounts(importedLedgerAccounts, networkId)
    },
  )
