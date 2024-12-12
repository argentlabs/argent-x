import { extensionOnlyProcedure } from "../permissions"
import { validatedImportSchema } from "../../../../shared/accountImport/types"
import { walletAccountSchema } from "../../../../shared/wallet.model"

export const importProcedure = extensionOnlyProcedure
  .input(validatedImportSchema)
  .output(walletAccountSchema)
  .mutation(
    async ({
      input: validatedAccount,
      ctx: {
        services: { wallet },
      },
    }) => {
      return await wallet.importAccount(validatedAccount)
    },
  )
