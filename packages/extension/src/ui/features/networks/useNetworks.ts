import { useMemo } from "react"
import useSWR from "swr"

import {
  customNetworksStore,
  defaultNetwork,
  extendByDefaultReadonlyNetworks,
} from "../../../shared/network"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { useAppState } from "./../../app.state"
import { getNetworkStatuses } from "../../services/backgroundNetworks"
import { SWRConfigCommon } from "../../services/swr"

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

export const useIsMainnet = () => {
  const { switcherNetworkId } = useAppState()
  return switcherNetworkId === "mainnet-alpha"
}

export const useNetworks = () => {
  const customNetworks = useArrayStorage(customNetworksStore)
  return useMemo(
    () => extendByDefaultReadonlyNetworks(customNetworks),
    [customNetworks],
  )
}

export const useCustomNetworks = () => {
  const customNetworks = useArrayStorage(customNetworksStore)
  return customNetworks
}

export const useNetwork = (networkId: string) => {
  const networks = useNetworks()
  return useMemo(
    () =>
      networks.find((network) => network.id === networkId) || defaultNetwork,
    [networks, networkId],
  )
}

export const useCurrentNetwork = () => {
  const { switcherNetworkId } = useAppState()
  return useNetwork(switcherNetworkId)
}
