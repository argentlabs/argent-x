import { addressSchema } from "@argent/x-shared"
import { extensionOnlyProcedure } from "../permissions"
import { openSessionMiddleware } from "../../middleware/session"

export const getTopperUrlProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addressSchema)
  .query(
    async ({
      input,
      ctx: {
        services: { onRampService },
      },
    }) => {
      return await onRampService.getTopperUrl(input)
    },
  )
