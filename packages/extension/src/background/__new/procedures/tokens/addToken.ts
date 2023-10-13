import { extensionOnlyProcedure } from "../permissions"
import { TokenSchema } from "../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../shared/token/__new/service"

export const addTokenProcedure = extensionOnlyProcedure
  .input(TokenSchema)
  .mutation(async ({ input: token }) => {
    // tokens that are added from the UI should always be shown with custom flag, even if the balance is 0
    return await tokenService.addToken({ ...token, custom: true })
  })
