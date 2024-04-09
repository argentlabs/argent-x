import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { addressSchema, callSchema, ensureArray } from "@argent/x-shared"
import {
  callsToInvocation,
  extendInvocationsByAccountDeploy,
  estimatedFeesToResponse,
} from "./helpers"
import { estimatedFeesSchema } from "../../../../shared/transactionSimulation/fees/fees.model"
import { AccountError } from "../../../../shared/errors/account"
import { getTxVersionFromFeeToken } from "../../../../shared/utils/getTransactionVersion"

const estimateRequestSchema = z.object({
  account: baseWalletAccountSchema,
  feeTokenAddress: addressSchema,
  transactions: z.array(callSchema).or(callSchema),
})

export const estimateTransactionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(estimateRequestSchema)
  .output(estimatedFeesSchema)
  .query(
    async ({
      input: { account, feeTokenAddress, transactions },
      ctx: {
        services: { wallet },
      },
    }) => {
      const walletAccount = await wallet.getAccount(account)
      if (!walletAccount) {
        throw new AccountError({ code: "NOT_FOUND" })
      }

      const snAccount = await wallet.getStarknetAccount(account)

      if (!("estimateFeeBulk" in snAccount)) {
        throw new AccountError({ code: "MISSING_METHOD" })
      }

      const transactionsInvocation = callsToInvocation(
        ensureArray(transactions),
      )

      const allInvocations = await extendInvocationsByAccountDeploy(
        [transactionsInvocation],
        walletAccount,
        snAccount,
        wallet,
      )

      const version = getTxVersionFromFeeToken(feeTokenAddress)

      const estimatedFees = await snAccount.estimateFeeBulk(allInvocations, {
        // skipValidate is true by default
        version,
      })

      try {
        return estimatedFeesToResponse(estimatedFees, feeTokenAddress)
      } catch (e) {
        throw new AccountError({
          code: "CANNOT_ESTIMATE_TRANSACTIONS",
          options: { error: e },
        })
      }
    },
  )
