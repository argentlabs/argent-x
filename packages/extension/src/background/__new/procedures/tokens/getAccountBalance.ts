import { addressSchema } from "@argent/shared"
import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { equalToken } from "../../../../shared/token/__new/utils"
import { BaseTokenWithBalanceSchema } from "../../../../shared/token/__new/types/tokenBalance.model"
import { TokenError } from "../../../../shared/errors/token"

const getAccountBalanceSchema = z.object({
  tokenAddress: addressSchema,
  accountAddress: addressSchema,
  networkId: z.string(),
})

export const getAccountBalanceProcedure = extensionOnlyProcedure
  .input(getAccountBalanceSchema)
  .output(BaseTokenWithBalanceSchema)
  .query(async ({ input: { tokenAddress, accountAddress, networkId } }) => {
    const [token] = await tokenService.getTokens((t) =>
      equalToken(t, { address: tokenAddress, networkId }),
    )
    if (!token) {
      throw new TokenError({
        code: "TOKEN_NOT_FOUND",
        message: `Token ${tokenAddress}  not found`,
      })
    }
    const account = { address: accountAddress, networkId }
    const [tokenBalance] = await tokenService.getTokenBalancesForAccount(
      account,
      [token],
    )
    return tokenBalance
  })
