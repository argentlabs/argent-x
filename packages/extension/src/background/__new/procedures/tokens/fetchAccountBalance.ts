import { addressSchema } from "@argent/shared"
import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { equalToken } from "../../../../shared/token/__new/utils"
import { TokenError } from "../../../../shared/errors/token"

const fetchTokenBalanceSchema = z.object({
  tokenAddress: addressSchema,
  accountAddress: addressSchema,
  networkId: z.string(),
})

export const fetchTokenBalanceProcedure = extensionOnlyProcedure
  .input(fetchTokenBalanceSchema)
  .output(z.string())
  .mutation(async ({ input: { tokenAddress, accountAddress, networkId } }) => {
    const account = { address: accountAddress, networkId }
    const baseToken = { address: tokenAddress, networkId }
    const [token] = await tokenService.getTokens((t) =>
      equalToken(t, baseToken),
    )

    if (!token) {
      throw new TokenError({
        code: "TOKEN_NOT_FOUND",
        message: `Token ${tokenAddress} not found`,
      })
    }
    const [tokenBalance] = await tokenService.fetchTokenBalancesFromOnChain(
      account,
      token,
    )

    return tokenBalance.balance
  })
