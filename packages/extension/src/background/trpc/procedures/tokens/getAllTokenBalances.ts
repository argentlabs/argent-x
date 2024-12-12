import { addressSchema } from "@argent/x-shared"

import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { equalToken } from "../../../../shared/token/__new/utils"
import { BaseTokenWithBalanceSchema } from "../../../../shared/token/__new/types/tokenBalance.model"

const getAllTokenBalancesSchema = z.object({
  tokenAddresses: z.array(addressSchema),
  accountAddress: addressSchema,
  networkId: z.string(),
})

export const getAllTokenBalancesProcedure = extensionOnlyProcedure
  .input(getAllTokenBalancesSchema)
  .output(z.array(BaseTokenWithBalanceSchema))
  .query(async ({ input: { tokenAddresses, accountAddress, networkId } }) => {
    const tokens = await tokenService.getTokens((t) =>
      tokenAddresses.some((tokenAddress) =>
        equalToken(t, { address: tokenAddress, networkId }),
      ),
    )
    const account = { address: accountAddress, networkId }
    const tokenBalances = await tokenService.getAllTokenBalancesForAccount(
      account,
      tokens,
    )
    return tokenBalances
  })
