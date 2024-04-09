import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { constants, num } from "starknet"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { changeGuardianCalldataSchema } from "@argent/x-shared"

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
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        const isRemoveGuardian = num.toBigInt(newGuardian) === constants.ZERO
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
                calldata: changeGuardianCalldataSchema.parse([newGuardian]),
              },
              meta: {
                isChangeGuardian: true,
                title: "Change account guardian",
                type: isRemoveGuardian // if guardian is 0, it's a remove guardian action
                  ? "REMOVE_ARGENT_SHIELD"
                  : "ADD_ARGENT_SHIELD",
              },
            },
          },
          {
            title: isRemoveGuardian
              ? "Remove Argent Shield"
              : "Add Argent Shield",
            icon: isRemoveGuardian
              ? "ArgentShieldDeactivateIcon"
              : "ArgentShieldIcon",
            subtitle: "",
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
