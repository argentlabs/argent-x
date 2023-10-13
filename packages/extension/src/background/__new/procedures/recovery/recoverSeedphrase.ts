import { compactDecrypt } from "jose"
import { z } from "zod"

import { bytesToUft8 } from "../../../../shared/utils/encode"
import { getMessagingKeys } from "../../../keys/messagingKeys"
import { extensionOnlyProcedure } from "../permissions"

const recoverSeedphraseSchema = z.object({
  jwe: z.string(),
})

export const recoverSeedphraseProcedure = extensionOnlyProcedure
  .input(recoverSeedphraseSchema)
  .mutation(
    async ({
      input: { jwe },
      ctx: {
        services: { wallet, transactionTracker },
      },
    }) => {
      const messagingKeys = await getMessagingKeys()

      const { plaintext } = await compactDecrypt(jwe, messagingKeys.privateKey)
      const {
        seedPhrase,
        newPassword,
      }: {
        seedPhrase: string
        newPassword: string
      } = JSON.parse(bytesToUft8(plaintext))

      await wallet.restoreSeedPhrase(seedPhrase, newPassword)
      void transactionTracker.loadHistory()
      return { isSuccess: true }
    },
  )
