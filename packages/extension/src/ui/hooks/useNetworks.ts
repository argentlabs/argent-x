import useSWR from "swr"
import type { FetcherResponse, PublicConfiguration } from "swr/dist/types"

import { Network, getNetwork } from "../../shared/networks"
import { getNetworks } from "../utils/messaging"

export const useNetworks = (
  config?: Partial<
    PublicConfiguration<
      Network[],
      any,
      (args_0: "customNetworks") => FetcherResponse<Network[]>
    >
  >,
) => {
  const { data: allNetworks = [], ...rest } = useSWR(
    ["customNetworks"],
    getNetworks,
    config,
  )

  return {
    allNetworks,
    ...rest,
  }
}

export const useNetwork = (
  networkId: string,
  config?: Partial<
    PublicConfiguration<
      Network[],
      any,
      (args_0: "customNetworks") => FetcherResponse<Network[]>
    >
  >,
) => {
  const { allNetworks, ...rest } = useNetworks(config)

  return {
    network: getNetwork(networkId, allNetworks),
    ...rest,
  }
}
