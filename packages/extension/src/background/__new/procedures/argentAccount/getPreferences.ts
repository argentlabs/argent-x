import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { preferencesEndpointPayload } from "./updatePreferences.model"

export const getPreferencesProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .output(preferencesEndpointPayload.optional())
  .query(
    async ({
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      const response = await argentAccountService.getPreferences()
      return response
    },
  )
