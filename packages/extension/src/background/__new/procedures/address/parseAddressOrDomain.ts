import { addressSchema, addressOrDomainSchema } from "@argent/shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { getMulticallForNetwork } from "../../../../shared/multicall"

const inputSchema = z.object({
  addressOrDomain: addressOrDomainSchema,
  networkId: z.string(),
})

export const parseAddressOrDomainProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .output(addressSchema)
  .query(
    async ({
      input: { addressOrDomain, networkId },
      ctx: {
        services: { starknetAddressService, networkService },
      },
    }) => {
      const network = await networkService.getById(networkId)
      const multicall = getMulticallForNetwork(network)
      return starknetAddressService.parseAddressOrDomain(
        addressOrDomain,
        networkId,
        multicall,
      )
    },
  )
