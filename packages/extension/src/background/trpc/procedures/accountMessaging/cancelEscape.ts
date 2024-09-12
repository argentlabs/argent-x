import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"

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
        const starknetAccount = await wallet.getSelectedStarknetAccount()
        const selectedAccount = await wallet.getSelectedAccount()
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
                ampliProperties: {
                  "is deployment": false,
                  "transaction type": "keep smart account",
                  "account type": sanitizeAccountType(selectedAccount?.type),
                  "account index": selectedAccount?.index,
                  "wallet platform": "browser extension",
                },
              },
            },
          },
          {
            title: "Keep guardian",
            icon: "SmartAccountActiveIcon",
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
