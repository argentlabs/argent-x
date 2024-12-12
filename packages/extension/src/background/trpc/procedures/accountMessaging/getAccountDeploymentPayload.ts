import { z } from "zod"

import { connectedDappsProcedure } from "../permissions"
import {
  baseWalletAccountSchema,
  cairoVersionSchema,
} from "../../../../shared/wallet.model"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"
import { AccountError } from "../../../../shared/errors/account"
import {
  addressSchema,
  bigNumberishSchema,
  rawArgsSchema,
} from "@argent/x-shared"
import { walletAccountToArgentAccount } from "../../../../shared/utils/isExternalAccount"

const getAccountDeploymentPayloadInputSchema = z
  .object({
    account: baseWalletAccountSchema,
  })
  .optional()

const deployAccountContractSchema = z
  .object({
    classHash: z.string(),
    constructorCalldata: rawArgsSchema,
    addressSalt: bigNumberishSchema.optional(),
    contractAddress: addressSchema.optional(),
    version: cairoVersionSchema.optional(),
  })
  .or(z.null())

export const getAccountDeploymentPayloadProcedure = connectedDappsProcedure
  .input(getAccountDeploymentPayloadInputSchema)
  .output(deployAccountContractSchema)
  .query(
    async ({
      input,
      ctx: {
        services: { wallet },
        senderType,
      },
    }) => {
      if (!(await wallet.isSessionOpen())) {
        throw new SessionError({
          code: "NO_OPEN_SESSION",
        })
      }
      try {
        const walletAccount = input?.account
          ? await wallet.getAccount(input.account.id)
          : await wallet.getSelectedAccount()
        if (!walletAccount) {
          throw new AccountError({
            code: "NOT_FOUND",
          })
        }

        if (senderType !== "extension" && walletAccount.needsDeploy === false) {
          return null
        }

        return await wallet.getAccountOrMultisigDeploymentPayload(
          walletAccountToArgentAccount(walletAccount),
        )
      } catch (e) {
        throw new AccountMessagingError({
          options: { error: e },
          code: "ACCOUNT_DEPLOYMENT_PAYLOAD_FAILED",
        })
      }
    },
  )
