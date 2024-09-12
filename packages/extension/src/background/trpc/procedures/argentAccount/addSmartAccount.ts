import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import {
  AddSmartAccountResponseSchema,
  AddSmartAcountRequestSchema,
} from "@argent/x-shared"

export const addSmartAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(AddSmartAcountRequestSchema)
  .output(AddSmartAccountResponseSchema)
  .mutation(
    async ({
      input: request,
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.addSmartAccount(request)
    },
  )
