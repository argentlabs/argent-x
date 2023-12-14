import { addressSchema, starknetDomainNameSchema } from "@argent/shared"
import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"
import { getMulticallForNetwork } from "../../../../shared/multicall"

const inputSchema = z.object({
  domain: starknetDomainNameSchema,
  networkId: z.string(),
})

export const getAddressFromDomainNameProcedure = extensionOnlyProcedure
  .input(inputSchema)
  .output(addressSchema)
  .query(
    async ({
      input: { domain, networkId },
      ctx: {
        services: { starknetAddressService, networkService },
      },
    }) => {
      const network = await networkService.getById(networkId)
      const multicall = getMulticallForNetwork(network)
      return starknetAddressService.getAddressFromDomainName(
        domain,
        networkId,
        multicall,
      )
    },
  )
