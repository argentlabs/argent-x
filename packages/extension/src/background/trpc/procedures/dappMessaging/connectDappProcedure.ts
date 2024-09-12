import { publicProcedure } from "../permissions"
import { openSessionMiddleware } from "../../middleware/session"
import { connectDapp } from "./connectDapp"
import { connectDappInputSchema } from "./schema"

export const connectDappProcedure = publicProcedure
  .use(openSessionMiddleware)
  .input(connectDappInputSchema)
  .mutation(
    async ({
      ctx: {
        services: {
          wallet,
          preAuthorizationService,
          backgroundUIService,
          uiService,
          actionService,
        },
      },
      input,
    }) => {
      return connectDapp({
        wallet,
        preAuthorizationService,
        backgroundUIService,
        actionService,
        uiService,
        input,
      })
    },
  )
