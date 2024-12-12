import { addressSchema } from "@argent/x-shared"
import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { equalToken } from "../../../../shared/token/__new/utils"
import { TokenError } from "../../../../shared/errors/token"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"

const fetchTokenBalanceSchema = z.object({
  tokenAddress: addressSchema,
  account: baseWalletAccountSchema,
})

export const fetchTokenBalanceProcedure = extensionOnlyProcedure
  .input(fetchTokenBalanceSchema)
  .output(z.string())
  .mutation(async ({ input: { tokenAddress, account } }) => {
    const baseToken = { address: tokenAddress, networkId: account.networkId }
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
