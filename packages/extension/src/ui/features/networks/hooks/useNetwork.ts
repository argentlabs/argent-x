import { useMemo } from "react"

import { defaultNetwork } from "../../../../shared/network"
import { useNetworks } from "./useNetworks"

export const useNetwork = (networkId: string) => {
  const networks = useNetworks()
  return useMemo(
    () =>
      networks.find((network) => network.id === networkId) || defaultNetwork,
    [networks, networkId],
  )
}
