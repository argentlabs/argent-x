import { z } from "zod"

import {
  argentAccountTypeSchema,
  baseWalletAccountSchema,
} from "../../../../shared/wallet.model"
import { upgradeAccount } from "../../../accountUpgrade"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const upgradeAccountSchema = z.object({
  account: baseWalletAccountSchema,
  targetImplementationType: argentAccountTypeSchema.optional(),
})
export const upgradeAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(upgradeAccountSchema)
  .mutation(
    async ({
      input: { account, targetImplementationType },
      ctx: {
        services: { wallet, actionService },
      },
    }) => {
      // TODO ⬇ should be a service
      await upgradeAccount({
        account,
        wallet,
        actionService,
        targetImplementationType,
      })
    },
  )
