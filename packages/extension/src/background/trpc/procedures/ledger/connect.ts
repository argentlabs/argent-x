import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { addressSchema } from "@argent/x-shared"

export const connectProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .output(addressSchema)
  .mutation(
    async ({
      ctx: {
        services: { ledgerService },
      },
    }) => {
      return ledgerService.connect()
    },
  )
