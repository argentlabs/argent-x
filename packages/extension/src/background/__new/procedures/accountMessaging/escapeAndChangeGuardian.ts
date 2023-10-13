import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { isEqualAddress } from "../../../../ui/services/addresses"
import { constants, num, Account } from "starknet"
import { getEntryPointSafe } from "../../../../shared/utils/transactions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { AccountError } from "../../../../shared/errors/account"

const escapeAndChangeGuardianSchema = z.object({
  account: baseWalletAccountSchema,
})

export const escapeAndChangeGuardianProcedure = extensionOnlyProcedure
  .input(escapeAndChangeGuardianSchema)
  .mutation(
    async ({
      input: { account },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      try {
        /**
         * This is a two-stage process
         *
         * 1. call escapeGuardian with current signer key as new guardian key
         * 2. changeGuardian to ZERO, signed twice by same signer key (like 2/2 multisig with same key)
         */

        const selectedAccount = await wallet.getAccount(account)
        const starknetAccount =
          (await wallet.getSelectedStarknetAccount()) as Account // Old accounts are not supported

        if (!selectedAccount) {
          throw new AccountError({
            code: "NOT_FOUND",
          })
        }

        const { publicKey } = await wallet.getPublicKey(account)

        if (
          selectedAccount.guardian &&
          isEqualAddress(selectedAccount.guardian, publicKey)
        ) {
          /**
           * Account already used `escapeGuardian` to change guardian to this account publicKey
           * Call `changeGuardian` to ZERO
           */

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
                  calldata: [num.hexToDecimalString(constants.ZERO.toString())],
                },
                meta: {
                  isChangeGuardian: true,
                  title: "Change account guardian",
                  type: "INVOKE",
                },
              },
            },
            {
              origin,
            },
          )
        } else {
          /**
           * Call `escapeGuardian` to change guardian to this account publicKey
           */
          await actionService.add(
            {
              type: "TRANSACTION",
              payload: {
                transactions: {
                  contractAddress: account.address,
                  entrypoint: "escapeGuardian",
                  calldata: [num.hexToDecimalString(publicKey)],
                },
                meta: {
                  isChangeGuardian: true,
                  title: "Escape account guardian",
                  type: "INVOKE",
                },
              },
            },
            {
              origin,
            },
          )
        }
      } catch (error) {
        throw new AccountMessagingError({
          options: {
            error,
          },
          code: "ESCAPE_AND_CHANGE_GUARDIAN_FAILED",
        })
      }
    },
  )
