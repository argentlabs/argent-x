import { extensionOnlyProcedure } from "../permissions"
import { BaseTokenSchema } from "../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../shared/token/__new/service"

export const removeTokenProcedure = extensionOnlyProcedure
  .input(BaseTokenSchema)
  .mutation(async ({ input: baseToken }) => {
    return await tokenService.removeToken(baseToken)
  })
