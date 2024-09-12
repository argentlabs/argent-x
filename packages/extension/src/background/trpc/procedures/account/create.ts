import { z } from "zod"

// TODO: ⬇ should be a service which get injected in ctx
import { tryToMintAllFeeTokens } from "../../../../shared/devnet/mintFeeToken"
import {
  createWalletAccountSchema,
  signerTypeSchema,
} from "../../../../shared/wallet.model"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const createAccountInputSchema = z.object({
  networkId: z.string(),
  type: z.union([
    z.literal("standard"),
    z.literal("multisig"),
    z.literal("standardCairo0"),
    z.literal("smart"),
  ]),
  signerType: signerTypeSchema,
})

export const createAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(createAccountInputSchema)
  .output(createWalletAccountSchema)
  .mutation(
    async ({
      input: { networkId: network, type, signerType },
      ctx: {
        services: { wallet },
      },
    }) => {
      const account = await wallet.newAccount(network, type, signerType)

      // NOTE: ⬇ should be a service
      void tryToMintAllFeeTokens(account)

      return account
    },
  )
