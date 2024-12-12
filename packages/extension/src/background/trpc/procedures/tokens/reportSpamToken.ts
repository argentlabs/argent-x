import { extensionOnlyProcedure } from "../permissions"
import { BaseTokenSchema } from "../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../shared/token/__new/service"
import { z } from "zod"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"

const inputSchema = z.object({
  token: BaseTokenSchema,
  account: baseWalletAccountSchema,
})

export const reportSpamTokenProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    return await tokenService.reportSpamToken(input.token, input.account)
  })
