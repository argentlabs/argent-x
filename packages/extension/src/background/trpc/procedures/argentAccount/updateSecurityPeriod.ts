import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"

export const updateSecurityPeriodProcedure = extensionOnlyProcedure
  .input(
    z.object({
      periodInSeconds: z.number(),
    }),
  )
  .mutation(
    async ({
      input: { periodInSeconds },
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      await argentAccountService.updateSecurityPeriod(periodInSeconds)
    },
  )
