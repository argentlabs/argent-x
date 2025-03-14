import { addressSchema } from "@argent/x-shared"
import { extensionOnlyProcedure } from "../permissions"
import { openSessionMiddleware } from "../../middleware/session"
import { z } from "zod"

const getTopperUrlInputSchema = z.object({
  address: addressSchema,
  assetSymbol: z.string().optional(),
})

export const getTopperUrlProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(getTopperUrlInputSchema)
  .query(
    async ({
      input,
      ctx: {
        services: { onRampService },
      },
    }) => {
      return await onRampService.getTopperUrl(input.address, input.assetSymbol)
    },
  )
