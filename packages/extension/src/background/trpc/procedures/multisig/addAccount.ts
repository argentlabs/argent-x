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
      try {
        return await multisigService.addAccount(input)
      } catch (error) {
        console.error("Error adding account", error)
        throw error
      }
    },
  )
