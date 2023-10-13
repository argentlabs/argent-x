import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { respond } from "../../../respond"

export const selectAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema.nullable())
  .mutation(
    async ({
      input: baseWalletAccount,
      ctx: {
        services: { wallet },
      },
    }) => {
      const account = await wallet.selectAccount(baseWalletAccount)
      if (account) {
        void respond({ type: "CONNECT_ACCOUNT_RES", data: account })
      }
    },
  )
