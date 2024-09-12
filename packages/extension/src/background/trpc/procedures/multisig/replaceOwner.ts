import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { replaceOwnerMultisigSchema } from "../../../../shared/multisig/multisig.model"

export const replaceOwnerProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(replaceOwnerMultisigSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.replaceOwner(input)
    },
  )
