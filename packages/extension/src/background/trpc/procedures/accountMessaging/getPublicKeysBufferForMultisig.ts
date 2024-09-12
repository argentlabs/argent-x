import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { PubKeyError } from "../../../../shared/errors/pubKey"

const getPublicKeysBufferForMultisigSchema = z.object({
  start: z.number(),
  buffer: z.number(),
})

export const getPublicKeysBufferForMultisigProcedure = extensionOnlyProcedure
  .input(getPublicKeysBufferForMultisigSchema)
  .output(z.array(z.string()))
  .query(
    async ({
      input: { start, buffer },
      ctx: {
        services: { wallet },
      },
    }) => {
      try {
        const pubKeys = await wallet.getPublicKeysBufferForMultisig(
          start,
          buffer,
        )
        return pubKeys
      } catch (error) {
        throw new PubKeyError({
          code: "FAILED_BUFFER_GENERATION",
        })
      }
    },
  )
