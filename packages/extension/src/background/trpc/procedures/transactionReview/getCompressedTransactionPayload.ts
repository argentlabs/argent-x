import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { estimatedFeesSchema } from "@argent/x-shared/simulation"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { bigNumberishSchema, callSchema } from "@argent/x-shared"

const getCompressedTransactionPayloadSchema = z.object({
  account: baseWalletAccountSchema,
  transactions: z.array(callSchema).or(callSchema),
  estimatedFees: estimatedFeesSchema.optional(),
  nonce: bigNumberishSchema.optional(),
})

export const getCompressedTransactionPayloadProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(getCompressedTransactionPayloadSchema)
  .output(z.string().nullable())
  .query(
    async ({
      ctx: {
        services: { transactionReviewService },
      },
      input: { account, transactions, estimatedFees, nonce },
    }) => {
      return transactionReviewService.getCompressedTransactionPayload(
        account,
        transactions,
        estimatedFees,
        nonce,
      )
    },
  )
