import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { addDeployAccountAction } from "../../../accountDeploy"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const deployAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      await addDeployAccountAction({
        account: input,
        actionService,
        wallet,
      })
    },
  )
