import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"

const deployContractSchema = z.object({
  address: z.string(),
  networkId: z.string(),
  classHash: z.string(),
  constructorCalldata: z.array(z.string()),
  salt: z.string().optional(),
  unique: z.boolean().optional(),
})

export const deployContractProcedure = extensionOnlyProcedure
  .input(deployContractSchema)
  .mutation(
    async ({
      input: {
        address,
        networkId,
        classHash,
        constructorCalldata,
        salt,
        unique,
      },
      ctx: {
        services: { actionService, wallet },
      },
    }) => {
      await wallet.selectAccount({ address, networkId })
      try {
        await actionService.add(
          {
            type: "DEPLOY_CONTRACT",
            payload: {
              classHash: classHash.toString(),
              constructorCalldata,
              salt,
              unique,
            },
          },
          {
            icon: "DocumentIcon",
          },
        )
      } catch (e) {
        throw new UdcError({ code: "NO_DEPLOY_CONTRACT" })
      }
    },
  )
