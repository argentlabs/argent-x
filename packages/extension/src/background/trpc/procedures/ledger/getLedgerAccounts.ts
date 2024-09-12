import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { importedLedgerAccountSchema } from "../../../../shared/wallet.model"

const getNextPublicKeyForMultisigSchema = z.object({
  networkId: z.string(),
  startIndex: z.number(),
  total: z.number(),
})

export const getLedgerAccountsProcedure = extensionOnlyProcedure
  .input(getNextPublicKeyForMultisigSchema)
  .output(z.array(importedLedgerAccountSchema))
  .query(
    async ({
      input: { networkId, startIndex, total },
      ctx: {
        services: { wallet },
      },
    }) => {
      return await wallet.getLedgerAccounts(networkId, startIndex, total)
    },
  )
