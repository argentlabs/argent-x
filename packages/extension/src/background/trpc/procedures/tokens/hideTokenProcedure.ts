import { extensionOnlyProcedure } from "../permissions"
import { BaseTokenSchema } from "../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../shared/token/__new/service"
import { z } from "zod"

const inputSchema = z.object({
  token: BaseTokenSchema,
  hidden: z.boolean(),
})

export const toggleHideTokenProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    return await tokenService.toggleHideToken(input.token, input.hidden)
  })
