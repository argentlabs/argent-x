import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { Account } from "starknet"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"

const cancelEscapeSchema = z.object({
  account: baseWalletAccountSchema,
})

export const cancelEscapeProcedure = extensionOnlyProcedure
  .input(cancelEscapeSchema)
  .mutation(
    async ({
      input: { account },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      try {
        const starknetAccount =
          (await wallet.getSelectedStarknetAccount()) as Account
        await actionService.add(
          {
            type: "TRANSACTION",
            payload: {
              transactions: {
                contractAddress: account.address,
                entrypoint: getEntryPointSafe(
                  "cancelEscape",
                  starknetAccount.cairoVersion,
                ),
                calldata: [],
              },
              meta: {
                isCancelEscape: true,
                title: "Cancel escape",
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
          code: "ESCAPE_CANCELLATION_FAILED",
        })
      }
    },
  )
