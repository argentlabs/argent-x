import { z } from "zod"

import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { extensionOnlyProcedure } from "../permissions"

const inputSchema = z.object({
  networkId: z.string(),
})

export const getLastUsedOnNetworkProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .output(baseWalletAccountSchema.optional())
  .query(
    async ({
      input: { networkId },
      ctx: {
        services: { wallet },
      },
    }) => {
      return wallet.getLastUsedOnNetwork(networkId)
    },
  )
