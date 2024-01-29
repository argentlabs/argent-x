import { z } from "zod"

import { connectedDappsProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"
import { AccountError } from "../../../../shared/errors/account"
import {
  addressSchema,
  bigNumberishSchema,
  rawArgsSchema,
} from "@argent/shared"

const getAccountDeploymentPayloadInputSchema = z
  .object({
    account: baseWalletAccountSchema,
  })
  .optional()

const deployAccountContractSchema = z.object({
  classHash: z.string(),
  constructorCalldata: rawArgsSchema,
  addressSalt: bigNumberishSchema.optional(),
  contractAddress: addressSchema.optional(),
})

export const getAccountDeploymentPayloadProcedure = connectedDappsProcedure
  .input(getAccountDeploymentPayloadInputSchema)
  .output(deployAccountContractSchema)
  .query(
    async ({
      input,
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
        const walletAccount = input?.account
          ? await wallet.getAccount(input.account)
          : await wallet.getSelectedAccount()
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
