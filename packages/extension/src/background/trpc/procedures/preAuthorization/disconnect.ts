import { preAuthorizationHostSchema } from "../../../../shared/preAuthorization/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { sendMessageToHost } from "../../../activeTabs"

export const disconnectProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(preAuthorizationHostSchema)
  .mutation(async ({ input }) => {
    await sendMessageToHost(
      {
        type: "DISCONNECT_ACCOUNT",
      },
      input,
    )
  })
