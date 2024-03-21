import { z } from "zod"

import {
  argentAccountTypeSchema,
  walletAccountSchema,
} from "../../../../shared/wallet.model"
import { upgradeAccount } from "../../../accountUpgrade"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { getAccountClassHashFromChain } from "../../../../shared/account/details"
import { networkService } from "../../../../shared/network/service"
import { isEqualAddress } from "@argent/x-shared"

const upgradeAccountSchema = z.object({
  account: walletAccountSchema,
  targetImplementationType: argentAccountTypeSchema.optional(),
})

export const upgradeAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(upgradeAccountSchema)
  .output(z.tuple([z.boolean(), walletAccountSchema]))
  .mutation(
    async ({
      input: { account, targetImplementationType },
      ctx: {
        services: { wallet, actionService },
      },
    }) => {
      const [onchainAccount] = await getAccountClassHashFromChain([account])

      const { accountClassHash } = await networkService.getById(
        account.network.id,
      )

      if (!accountClassHash) {
        throw new Error("Account class hash not found")
      }

      const targetClassHash =
        accountClassHash[targetImplementationType ?? account.type]

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
