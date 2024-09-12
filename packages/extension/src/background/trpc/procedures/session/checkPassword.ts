import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { compactDecrypt } from "jose"
import { BUGGY_bytesToUft8, bytesToUft8 } from "../../../../shared/utils/encode"
import { SessionError } from "../../../../shared/errors/session"

const checkPasswordSchema = z.string()

export const checkPasswordProcedure = extensionOnlyProcedure
  .input(checkPasswordSchema)
  .output(z.boolean())
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
        const [BUGGY_password, password] = [
          BUGGY_bytesToUft8(plaintext),
          bytesToUft8(plaintext),
        ]
        // Check for the buggy bytesToUtf8 first because most users will have the buggy version.
        if (await wallet.checkPassword(BUGGY_password)) {
          return true
        }
        if (await wallet.checkPassword(password)) {
          return true
        }
        return false
      } catch (error) {
        throw new SessionError({
          code: "PASSWORD_CHECK_FAILED",
          options: { error },
        })
      }
    },
  )
