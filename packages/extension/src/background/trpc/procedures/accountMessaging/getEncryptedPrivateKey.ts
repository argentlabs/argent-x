import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"
import { encryptForUi } from "../../../crypto"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"

const getEncryptedPrivateKeySchema = z.object({
  encryptedSecret: z.string(),
  account: baseWalletAccountSchema,
})

export const getEncryptedPrivateKeyProcedure = extensionOnlyProcedure
  .input(getEncryptedPrivateKeySchema)
  .output(z.string())
  .mutation(
    async ({
      input: { account, encryptedSecret },
      ctx: {
        services: { wallet, messagingKeys },
      },
    }) => {
      if (!(await wallet.isSessionOpen())) {
        throw new SessionError({
          code: "NO_OPEN_SESSION",
        })
      }
      try {
        return await encryptForUi(
          await wallet.getPrivateKey(account),
          encryptedSecret,
          messagingKeys.privateKey,
        )
      } catch (e) {
        throw new AccountMessagingError({
          options: { error: e },
          code: "GET_ENCRYPTED_KEY_FAILED",
        })
      }
    },
  )
