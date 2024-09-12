import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"

const getPublicKeySchema = z.object({
  account: z.optional(baseWalletAccountSchema),
})

export const getPublicKeyProcedure = extensionOnlyProcedure
  .input(getPublicKeySchema)
  .output(z.string())
  .query(
    async ({
      input: { account },
      ctx: {
        services: { wallet },
      },
    }) => {
      try {
        const { publicKey } = await wallet.getPublicKey(account)
        return publicKey
      } catch (error) {
        throw new AccountMessagingError({
          options: { error },
          code: "GET_PUBLIC_KEY_FAILED",
        })
      }
    },
  )
