import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { updateMultisigThresholdSchema } from "../../../../shared/multisig/multisig.model"

export const updateThresholdProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(updateMultisigThresholdSchema)
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      return await multisigService.updateThreshold(input)
    },
  )
