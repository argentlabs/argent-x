import { addressSchema } from "@argent/x-shared"

import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { equalToken } from "../../../../shared/token/__new/utils"

const inputSchema = z.object({
  tokenAddress: addressSchema,
  accountAddress: addressSchema,
  networkId: z.string(),
})

export const getTokenBalanceProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .query(async ({ input: { tokenAddress, accountAddress, networkId } }) => {
    const [token] = await tokenService.getTokens((t) =>
      equalToken(t, { address: tokenAddress, networkId }),
    )
    const account = { address: accountAddress, networkId }
    return tokenService.getTokenBalanceForAccount(account, token)
  })
