import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { constants, num, Account } from "starknet"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"

const changeGuardianSchema = z.object({
  guardian: z.string(),
  account: baseWalletAccountSchema,
})

export const changeGuardianProcedure = extensionOnlyProcedure
  .input(changeGuardianSchema)
  .mutation(
    async ({
      input: { account, guardian },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      try {
        const newGuardian = num.hexToDecimalString(guardian)
        const starknetAccount =
          (await wallet.getSelectedStarknetAccount()) as Account // Old accounts are not supported

        await actionService.add(
          {
            type: "TRANSACTION",
            payload: {
              transactions: {
                contractAddress: account.address,
                entrypoint: getEntryPointSafe(
                  "changeGuardian",
                  starknetAccount.cairoVersion,
                ),
                calldata: [newGuardian],
              },
              meta: {
                isChangeGuardian: true,
                title: "Change account guardian",
                type:
                  num.toBigInt(newGuardian) === constants.ZERO // if guardian is 0, it's a remove guardian action
                    ? "REMOVE_ARGENT_SHIELD"
                    : "ADD_ARGENT_SHIELD",
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
          code: "CHANGE_GUARDIAN_FAILED",
        })
      }
    },
  )
