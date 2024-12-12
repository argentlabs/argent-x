import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const urlSchema = z.string().optional()

export const openUIProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(urlSchema)
  .query(
    async ({
      ctx: {
        services: { backgroundUIService },
      },
    }) => {
      return backgroundUIService.openUiAsFloatingWindow()
    },
  )
