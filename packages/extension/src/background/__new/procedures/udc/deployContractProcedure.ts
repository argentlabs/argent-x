import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"
import { deployContractSchema } from "../../../../shared/udc/schema"

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
