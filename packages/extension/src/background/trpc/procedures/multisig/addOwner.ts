import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { addOwnerMultisigSchema } from "../../../../shared/multisig/multisig.model"

export const addOwnerProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addOwnerMultisigSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.addOwner(input)
    },
  )
