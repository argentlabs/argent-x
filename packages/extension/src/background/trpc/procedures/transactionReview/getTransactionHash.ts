import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { estimatedFeesSchema } from "@argent/x-shared/simulation"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { bigNumberishSchema, callSchema, hexSchema } from "@argent/x-shared"

const getTransactionHashSchema = z.object({
  account: baseWalletAccountSchema,
  transactions: z.array(callSchema).or(callSchema),
  estimatedFees: estimatedFeesSchema.optional(),
  nonce: bigNumberishSchema.optional(),
})

export const getTransactionHashProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(getTransactionHashSchema)
  .output(hexSchema.nullable())
  .query(
    async ({
      ctx: {
        services: { transactionReviewService },
      },
      input: { account, transactions, estimatedFees, nonce },
    }) => {
      return transactionReviewService.getTransactionHash(
        account,
        transactions,
        estimatedFees,
        nonce,
      )
    },
  )
