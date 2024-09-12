import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { removeOwnerMultisigSchema } from "../../../../shared/multisig/multisig.model"

export const removeOwnerProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(removeOwnerMultisigSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.removeOwner(input)
    },
  )
