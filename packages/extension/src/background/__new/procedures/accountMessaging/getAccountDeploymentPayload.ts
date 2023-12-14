import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"
import { AccountError } from "../../../../shared/errors/account"
import {
  addressSchema,
  bigNumberishSchema,
  rawArgsSchema,
} from "@argent/shared"

const getAccountDeploymentPayloadInputSchema = z.object({
  account: baseWalletAccountSchema,
})

const deployAccountContractSchema = z.object({
  classHash: z.string(),
  constructorCalldata: rawArgsSchema,
  addressSalt: bigNumberishSchema.optional(),
  contractAddress: addressSchema.optional(),
})

export const getAccountDeploymentPayloadProcedure = extensionOnlyProcedure
  .input(getAccountDeploymentPayloadInputSchema)
  .output(deployAccountContractSchema)
  .query(
    async ({
      input: { account },
      ctx: {
        services: { wallet },
      },
    }) => {
      if (!(await wallet.isSessionOpen())) {
        throw new SessionError({
          code: "NO_OPEN_SESSION",
        })
      }
      try {
        const walletAccount = await wallet.getAccount(account)
        if (!walletAccount) {
          throw new AccountError({
            code: "NOT_FOUND",
          })
        }

        return await wallet.getAccountDeploymentPayload(walletAccount)
      } catch (e) {
        throw new AccountMessagingError({
          options: { error: e },
          code: "GET_ENCRYPTED_KEY_FAILED",
        })
      }
    },
  )
