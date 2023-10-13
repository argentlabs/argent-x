import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"

export const isPasswordSetProcedure = extensionOnlyProcedure
  .output(z.boolean())
  .query(
    async ({
      ctx: {
        services: { wallet },
      },
    }) => {
      return wallet.isSessionOpen()
    },
  )
