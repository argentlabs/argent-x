import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { addAccountSchema } from "../../../../shared/multisig/multisig.model"

export const addAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addAccountSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addAccount(input)
    },
  )
