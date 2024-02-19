import { extensionOnlyProcedure } from "../permissions"
import { TokenSchema } from "../../../../shared/token/__new/types/token.model"

export const addTokenProcedure = extensionOnlyProcedure
  .input(TokenSchema)
  .mutation(
    async ({
      input: token,
      ctx: {
        services: { tokenService },
      },
    }) => {
      // tokens that are added from the UI should never be shown with custom flag, even if the balance is 0
      return await tokenService.addToken({ ...token, custom: true })
    },
  )
