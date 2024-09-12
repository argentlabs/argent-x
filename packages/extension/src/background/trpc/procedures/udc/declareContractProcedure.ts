import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"
import { declareContractSchema } from "../../../../shared/udc/schema"

export const declareContractProcedure = extensionOnlyProcedure
  .input(declareContractSchema)
  .output(z.string())
  .mutation(
    async ({
      input: { address, networkId, ...rest },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      if (address && networkId) {
        await wallet.selectAccount({
          address,
          networkId,
        })
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
      } catch (e) {
        throw new UdcError({ code: "NO_DEPLOY_CONTRACT" })
      }
    },
  )
