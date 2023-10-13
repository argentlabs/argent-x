import { useView } from "../../../views/implementation/react"
import { networkOrDefaultView, networkView } from "../../../views/network"

export const useNetwork = (networkId: string) => {
  return useView(networkOrDefaultView(networkId))
}

export const useNetworkOrUndefined = (networkId?: string) => {
  return useView(networkView(networkId))
}
