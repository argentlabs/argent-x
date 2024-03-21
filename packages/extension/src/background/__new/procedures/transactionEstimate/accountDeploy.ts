import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { addressSchema } from "@argent/x-shared"
import { estimatedFeeSchema } from "../../../../shared/transactionSimulation/fees/fees.model"
import { AccountError } from "../../../../shared/errors/account"
import { getErrorObject } from "../../../../shared/utils/error"

const estimateRequestSchema = z.object({
  account: baseWalletAccountSchema.optional(),
  feeTokenAddress: addressSchema,
})

export const estimateAccountDeployProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(estimateRequestSchema)
  .output(estimatedFeeSchema)
  .query(
    async ({
      input: { account: providedAccount, feeTokenAddress },
      ctx: {
        services: { wallet },
      },
    }) => {
      const account = providedAccount
        ? await wallet.getAccount(providedAccount)
        : await wallet.getSelectedAccount()

      if (!account) {
        throw new AccountError({ code: "NOT_FOUND" })
      }

      try {
        return await wallet.getAccountDeploymentFee(account, feeTokenAddress)
      } catch (error) {
        console.error("estimateAccountDeployProcedure", error)
        throw new AccountError({
          code: "CANNOT_ESTIMATE_DEPLOY_ACCOUNT",
          options: { error: getErrorObject(error) },
        })
      }
    },
  )
