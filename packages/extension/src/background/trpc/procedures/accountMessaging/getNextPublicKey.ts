import { z } from "zod"

import {
  createAccountTypeSchema,
  signerTypeSchema,
} from "../../../../shared/wallet.model"
import { extensionOnlyProcedure } from "../permissions"

const getNextPublicKeyForMultisigSchema = z.object({
  networkId: z.string(),
  signerType: signerTypeSchema,
  accountType: createAccountTypeSchema,
})

const getNextPublicKeyForMultisigOutputSchema = z.object({
  publicKey: z.string(),
  index: z.number(),
  derivationPath: z.string(),
})

export const getNextPublicKeyProcedure = extensionOnlyProcedure
  .input(getNextPublicKeyForMultisigSchema)
  .output(getNextPublicKeyForMultisigOutputSchema)
  .mutation(
    async ({
      input: { accountType, signerType, networkId },
      ctx: {
        services: { wallet },
      },
    }) => {
      const result = await wallet.getNextPublicKey(
        accountType,
        signerType,
        networkId,
      )
      return result
    },
  )
