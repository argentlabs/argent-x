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
  contract_class_version: z.string(),
  entry_points_by_type: z.any().optional(),
  sierra_program: z.array(z.string()).optional(),
})

export type BasicContractClass = z.infer<typeof basicContractClassSchema>

export const getConstructorParamsProcedure = extensionOnlyProcedure
  .input(getConstructorParamsSchema)
  .output(
    z.custom((item) => {
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

      const extendedContract: BasicContractClass = {
        ...contract,
        sierra_program:
          "sierra_program" in contract ? contract.sierra_program : [],
        contract_class_version:
          "contract_class_version" in contract
            ? contract.contract_class_version
            : "0",
      }

      return extendedContract
    } catch (error) {
      throw new UdcError({
        options: { error },
        code: "FETCH_CONTRACT_CONTRUCTOR_PARAMS",
      })
    }
  })
