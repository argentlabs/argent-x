import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"

export const deployProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.deploy(input)
    },
  )
