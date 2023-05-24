import { compactDecrypt } from "jose"
import { z } from "zod"

import { accountService } from "../../../../shared/account/service"
import { bytesToUft8 } from "../../../../shared/utils/encode"
import { getMessagingKeys } from "../../../keys/messagingKeys"
import { extensionOnlyProcedure } from "../permissions"

const recoverSeedphraseSchema = z.object({
  jwe: z.string(),
})

const recoverSeedphraseResponseSchema = z.object({
  isSuccess: z.boolean(),
})
export const recoverSeedphraseProcedure = extensionOnlyProcedure
  .input(recoverSeedphraseSchema)
  .output(recoverSeedphraseResponseSchema)
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
      void transactionTracker.loadHistory(await accountService.get())
      return { isSuccess: true }
    },
  )
