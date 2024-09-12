import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { tokenService } from "../../../../shared/token/__new/service"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"

const currencyBalanceForAccountSchema = baseWalletAccountSchema.extend({
  currencyBalance: z.string(),
})

export const fetchCurrencyBalanceForAccountsFromBackendProcedure =
  extensionOnlyProcedure
    .input(z.array(baseWalletAccountSchema))
    .output(z.array(currencyBalanceForAccountSchema))
    .query(async ({ input: accounts }) => {
      const balancesPerAccount = await Promise.all(
        accounts.map(async (account) => {
          const balances =
            await tokenService.fetchAccountTokenBalancesFromBackend(account)
          const currencyBalance =
            await tokenService.getTotalCurrencyBalance(balances)
          return {
            ...account,
            currencyBalance,
          }
        }),
      )

      return balancesPerAccount
    })
