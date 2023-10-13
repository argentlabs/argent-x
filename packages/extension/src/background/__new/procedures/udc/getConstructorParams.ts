import { LegacyContractClass } from "starknet"
import { z } from "zod"

import { getProvider } from "../../../../shared/network"
import { networkService } from "../../../../shared/network/service"
import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"

const getConstructorParamsSchema = z.object({
  networkId: z.string(),
  classHash: z.string(),
})

const basicContractClassSchema = z.object({
  abi: z.array(z.any()),
})

export const getConstructorParamsProcedure = extensionOnlyProcedure
  .input(getConstructorParamsSchema)
  .output(
    z.custom<LegacyContractClass>((item) => {
      return basicContractClassSchema.parse(item)
    }),
  )
  .query(async ({ input: { networkId, classHash } }) => {
    const network = await networkService.getById(networkId)
    const provider = getProvider(network)

    try {
      if (!("getClassByHash" in provider)) {
        throw new UdcError({
          code: "FETCH_CONTRACT_CONTRUCTOR_PARAMS",
        })
      }

      const contract = await provider.getClassByHash(classHash)

      if ("sierra_program" in contract) {
        throw new UdcError({
          code: "CAIRO_1_NOT_SUPPORTED",
        })
      }

      return contract
    } catch (error) {
      throw new UdcError({
        options: { error },
        code: "FETCH_CONTRACT_CONTRUCTOR_PARAMS",
      })
    }
  })
