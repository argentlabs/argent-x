import { z } from "zod"
import { BaseTokenWithBalanceSchema } from "../../../../shared/token/__new/types/tokenBalance.model"
import { TokenWithBalanceAndPriceSchema } from "../../../../shared/token/__new/types/tokenPrice.model"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"

export const getCurrencyValueForTokensProcedure = extensionOnlyProcedure
  .input(z.array(BaseTokenWithBalanceSchema))
  .output(z.array(TokenWithBalanceAndPriceSchema))
  .query(async ({ input: tokenWithBalances }) => {
    const tokensWithBalancesAndPrice =
      await tokenService.getCurrencyValueForTokens(tokenWithBalances)

    return tokensWithBalancesAndPrice
  })
