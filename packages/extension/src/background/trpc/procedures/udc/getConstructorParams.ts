import { z } from "zod"

import { getProvider } from "../../../../shared/network"
import { networkService } from "../../../../shared/network/service"
import { extensionOnlyProcedure } from "../permissions"
import { UdcError } from "../../../../shared/errors/udc"
import {
  getConstructorParamsSchema,
  basicContractClassSchema,
  BasicContractClass,
} from "../../../../shared/udc/schema"

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
