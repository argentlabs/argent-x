import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"

export const getSecurityPeriodProcedure = extensionOnlyProcedure
  .output(z.number())
  .query(
    async ({
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.getSecurityPeriod()
    },
  )
