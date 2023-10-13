import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { PubKeyError } from "../../../../shared/errors/pubKey"

const getNextPublicKeyForMultisigSchema = z.object({
  networkId: z.string(),
})

export const getNextPublicKeyForMultisigProcedure = extensionOnlyProcedure
  .input(getNextPublicKeyForMultisigSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { networkId },
      ctx: {
        services: { wallet },
      },
    }) => {
      try {
        const { publicKey } = await wallet.getNextPublicKeyForMultisig(
          networkId,
        )
        return publicKey
      } catch (error) {
        throw new PubKeyError({
          code: "FAILED_NEXT_PUB_KEY_GENERATION",
        })
      }
    },
  )
