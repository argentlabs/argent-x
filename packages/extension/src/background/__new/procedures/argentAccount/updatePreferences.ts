import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { preferencesEndpointPayload } from "../../../../shared/argentAccount/schema"

export const updatePreferencesProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(preferencesEndpointPayload)
  .output(preferencesEndpointPayload.optional())
  .mutation(
    async ({
      input: data,
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      const response = await argentAccountService.updatePreferences(data)
      return response
    },
  )
