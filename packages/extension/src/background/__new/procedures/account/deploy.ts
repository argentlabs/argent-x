import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { deployAccountAction } from "../../../accountDeploy"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const deployAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { actionService },
      },
    }) => {
      await deployAccountAction({
        account: input,
        actionService,
      })
    },
  )
