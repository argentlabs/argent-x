import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"
import { declareContractSchema } from "../../../../shared/udc/schema"

export const declareContractProcedure = extensionOnlyProcedure
  .input(declareContractSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { accountId, ...rest },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      if (accountId) {
        await wallet.selectAccount(accountId)
      }
      try {
        const action = await actionService.add(
          {
            type: "DECLARE_CONTRACT",
            payload: {
              ...rest,
            },
          },
          {
            icon: "DocumentIcon",
          },
        )
        return action.meta.hash
      } catch {
        throw new UdcError({ code: "NO_DEPLOY_CONTRACT" })
      }
    },
  )
