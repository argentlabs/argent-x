import useSWR from "swr"

import { getNetwork } from "../../../shared/networks"
import { useAppState } from "./../../app.state"
import {
  getNetworkStatuses,
  getNetworks,
} from "../../services/backgroundNetworks"
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

export const useCurrentNetwork = () => {
  const { switcherNetworkId } = useAppState()

  const currentNetwork = useNetwork(switcherNetworkId)

  return currentNetwork.network
}

export const useIsMainnet = () => {
  const { switcherNetworkId } = useAppState()
  const isMainnet = switcherNetworkId === "mainnet-alpha"
  return isMainnet
}
