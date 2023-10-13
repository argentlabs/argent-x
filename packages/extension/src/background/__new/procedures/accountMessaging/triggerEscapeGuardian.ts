import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"

const triggerEscapeGuardianSchema = z.object({
  account: baseWalletAccountSchema,
})

export const triggerEscapeGuardianProcedure = extensionOnlyProcedure
  .input(triggerEscapeGuardianSchema)
  .mutation(
    async ({
      input: { account },
      ctx: {
        services: { actionService },
      },
    }) => {
      try {
        await actionService.add(
          {
            type: "TRANSACTION",
            payload: {
              transactions: {
                contractAddress: account.address,
                entrypoint: "triggerEscapeGuardian",
                calldata: [],
              },
              meta: {
                isCancelEscape: true,
                title: "Trigger escape guardian",
                type: "INVOKE",
              },
            },
          },
          {
            origin,
          },
        )
      } catch (error) {
        throw new AccountMessagingError({
          options: { error },
          code: "TRIGGER_ESCAPE_FAILED",
        })
      }
    },
  )
