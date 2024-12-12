import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { encryptForUi } from "../../../crypto"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"

const getEncryptedPrivateKeySchema = z.object({
  encryptedSecret: z.string(),
  accountId: z.string(),
})

export const getEncryptedPrivateKeyProcedure = extensionOnlyProcedure
  .input(getEncryptedPrivateKeySchema)
  .output(z.string())
  .mutation(
    async ({
      input: { accountId, encryptedSecret },
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
          await wallet.getPrivateKey(accountId),
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
