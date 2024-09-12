import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import {
  createAccountTypeSchema,
  signerTypeSchema,
} from "../../../../shared/wallet.model"

const getNextPublicKeyForMultisigSchema = z.object({
  networkId: z.string(),
  signerType: signerTypeSchema,
  accountType: createAccountTypeSchema,
})

export const getNextPublicKeyProcedure = extensionOnlyProcedure
  .input(getNextPublicKeyForMultisigSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { accountType, signerType, networkId },
      ctx: {
        services: { wallet },
      },
    }) => {
      const { publicKey } = await wallet.getNextPublicKey(
        accountType,
        signerType,
        networkId,
      )
      return publicKey
    },
  )
