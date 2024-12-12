import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"

const getPublicKeySchema = z.object({
  accountId: z.string().optional(),
})

export const getPublicKeyProcedure = extensionOnlyProcedure
  .input(getPublicKeySchema)
  .output(z.string())
  .query(
    async ({
      input: { accountId },
      ctx: {
        services: { wallet },
      },
    }) => {
      try {
        const { publicKey } = await wallet.getPublicKey(accountId)
        return publicKey
      } catch (error) {
        throw new AccountMessagingError({
          options: { error },
          code: "GET_PUBLIC_KEY_FAILED",
        })
      }
    },
  )
