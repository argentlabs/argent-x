import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { deployAccountAction } from "../../../accountDeploy"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const deployAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema)
  .mutation(async ({ input: data, ctx: { services } }) => {
    await deployAccountAction({
      account: data,
      actionQueue: services.actionQueue,
    })
  })
