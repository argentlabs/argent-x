import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { encryptForUi } from "../../../crypto"
import { AccountMessagingError } from "../../../../shared/errors/accountMessaging"
import { SessionError } from "../../../../shared/errors/session"

const getEncryptedSeedPhraseSchema = z.object({
  encryptedSecret: z.string(),
})

export const getEncryptedSeedPhraseProcedure = extensionOnlyProcedure
  .input(getEncryptedSeedPhraseSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { encryptedSecret },
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
          await wallet.getSeedPhrase(),
          encryptedSecret,
          messagingKeys.privateKey,
        )
      } catch (e) {
        throw new AccountMessagingError({
          options: { error: e },
          code: "GET_SEEDPHRASE_FAILED",
        })
      }
    },
  )
