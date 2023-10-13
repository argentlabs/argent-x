import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { compactDecrypt } from "jose"
import { BUGGY_bytesToUft8, bytesToUft8 } from "../../../../shared/utils/encode"
import { respond } from "../../../respond"
import { walletAccountSchema } from "../../../../shared/wallet.model"
import { SessionError } from "../../../../shared/errors/session"

const startSchema = z.string()

export const startProcedure = extensionOnlyProcedure
  .input(startSchema)
  .output(walletAccountSchema.optional())
  .mutation(
    async ({
      input: encryptedPassword,
      ctx: {
        services: { wallet, messagingKeys },
      },
    }) => {
      try {
        const { plaintext } = await compactDecrypt(
          encryptedPassword,
          messagingKeys.privateKey,
        )

        const [BUGGY_sessionPassword, sessionPassword] = [
          BUGGY_bytesToUft8(plaintext),
          bytesToUft8(plaintext),
        ]

        const progressCallback = (percent: number) =>
          void respond({ type: "LOADING_PROGRESS", data: percent })

        try {
          // Check for the buggy bytesToUtf8 first because most users will have the buggy version.
          const result = await wallet.startSession(
            BUGGY_sessionPassword,
            progressCallback,
          )

          if (!result) {
            throw new SessionError({
              code: "START_SESSION_FAILED_BUGGY",
            })
          }
        } catch (error) {
          // For users who have superscript characters in their password, the buggy version of bytesToUtf8 will fail.
          // That's why we try the correct version here.
          const result = await wallet.startSession(
            sessionPassword,
            progressCallback,
          )

          if (!result) {
            throw new SessionError({
              code: "START_SESSION_FAILED",
              options: { error },
            })
          }
        }

        const selectedAccount = await wallet.getSelectedAccount()
        return selectedAccount
      } catch (error) {
        throw new SessionError({
          code: "START_SESSION_FAILED",
          options: { error },
        })
      }
    },
  )
