import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { constants, num } from "starknet"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"
import { getChangeGuardianCalldataForAccount } from "../../../../shared/smartAccount/getChangeGuardianCalldata"

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
        const selectedAccount = await wallet.getSelectedAccount()
        if (!selectedAccount) {
          throw new Error("no selected account")
        }
        const isRemoveGuardian = num.toBigInt(newGuardian) === constants.ZERO
        const calldata = getChangeGuardianCalldataForAccount({
          account: selectedAccount,
          guardian,
        })
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
                calldata,
              },
              meta: {
                isChangeGuardian: true,
                title: "Change guardian",
                type: isRemoveGuardian // if guardian is 0, it's a remove guardian action
                  ? "REMOVE_GUARDIAN"
                  : "ADD_GUARDIAN",
                ampliProperties: {
                  "is deployment": false,
                  "transaction type": isRemoveGuardian
                    ? "remove guardian"
                    : "add guardian",
                  "account type": sanitizeAccountType(selectedAccount?.type),
                  "account index": selectedAccount?.index,
                  "wallet platform": "browser extension",
                },
              },
            },
          },
          {
            title: isRemoveGuardian ? "Remove Guardian" : "Add Guardian",
            shortTitle: "Change guardian",
            icon: isRemoveGuardian
              ? "NoShieldSecondaryIcon"
              : "ShieldSecondaryIcon",
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
