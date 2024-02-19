import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { provisionStatusSchema } from "../../../../shared/provision/types"

export const getStatusProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .output(provisionStatusSchema)
  .query(
    async ({
      ctx: {
        services: { provisionService },
      },
    }) => {
      const response = await provisionService.getStatus()
      return response
    },
  )
