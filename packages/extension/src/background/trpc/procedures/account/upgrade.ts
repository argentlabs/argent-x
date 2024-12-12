import { z } from "zod"

import {
  accountIdSchema,
  argentAccountTypeSchema,
  walletAccountSchema,
} from "../../../../shared/wallet.model"
import { upgradeAccount } from "../../../accountUpgrade"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { getAccountClassHashFromChain } from "../../../../shared/account/details"
import { networkService } from "../../../../shared/network/service"
import { isEqualAddress } from "@argent/x-shared"
import {
  isArgentAccount,
  isImportedArgentAccount,
} from "../../../../shared/utils/isExternalAccount"
import { AccountError } from "../../../../shared/errors/account"

const upgradeAccountSchema = z.object({
  accountId: accountIdSchema,
  targetImplementationType: argentAccountTypeSchema.optional(),
})

export const upgradeAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(upgradeAccountSchema)
  .output(z.tuple([z.boolean(), walletAccountSchema]))
  .mutation(
    async ({
      input: { accountId, targetImplementationType },
      ctx: {
        services: { wallet, actionService },
      },
    }) => {
      const account = await wallet.getAccount(accountId)

      if (!account) {
        throw new Error("Account not found")
      }

      const onchainAccount = isArgentAccount(account)
        ? (await getAccountClassHashFromChain([account]))[0]
        : isImportedArgentAccount(account) // Support upgrade for imported argent accounts
          ? {
              id: account.id,
              address: account.address,
              networkId: account.network.id,
              classHash: account.classHash,
              type: account.type,
            }
          : null

      if (!onchainAccount) {
        throw new AccountError({ code: "IMPORTED_UPGRADE_NOT_SUPPORTED" })
      }

      const { accountClassHash } = await networkService.getById(
        account.network.id,
      )

      if (!accountClassHash) {
        throw new Error("Account class hash not found")
      }

      const accountClassHashType =
        targetImplementationType || isImportedArgentAccount(account)
          ? "standard"
          : account.type

      const targetClassHash = accountClassHash[accountClassHashType]

      if (
        onchainAccount.classHash &&
        isEqualAddress(onchainAccount.classHash, targetClassHash)
      ) {
        const updatedAccount = {
          ...account,
          classHash: onchainAccount.classHash,
          type: onchainAccount.type,
        }

        return [false, updatedAccount] // Upgrade not needed
      }

      // TODO ⬇ should be a service
      await upgradeAccount({
        account,
        wallet,
        actionService,
        targetImplementationType,
      })

      return [true, account] // Upgrade needed, return the account as is
    },
  )
