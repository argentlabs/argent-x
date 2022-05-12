import useSWR from "swr"

import { getNetwork } from "../../../shared/networks"
import { getNetworkStatuses, getNetworks } from "../../services/messaging"
import { SWRConfigCommon } from "../../services/swr"

export const useNetworks = (config?: SWRConfigCommon) => {
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

export const useNetwork = (networkId: string, config?: SWRConfigCommon) => {
  const { allNetworks, ...rest } = useNetworks(config)

  return {
    network: getNetwork(networkId, allNetworks),
    ...rest,
  }
}

export const useNetworkStatuses = (config?: SWRConfigCommon) => {
  const { data: networkStatuses = {}, ...rest } = useSWR(
    "networkStatuses-all",
    () => getNetworkStatuses(),
    {
      refreshInterval: 15e3 /* 15 seconds */, // gets cached in background anyways, so we can refresh it as fast as we want/makes sense
      ...config,
    },
  )
  return {
    networkStatuses,
    ...rest,
  }
}
