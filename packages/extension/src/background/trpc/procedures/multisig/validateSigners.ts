import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { z } from "zod"

export const validateSignersProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(z.string().array()) // base58 encoded strings
  .output(z.boolean())
  .mutation(
    async ({
      input,
      ctx: {
        services: { multisigService },
      },
    }) => {
      try {
        return await multisigService.validateSigners(input)
      } catch (error) {
        console.error("Error validating signers", error)
        throw error
      }
    },
  )
