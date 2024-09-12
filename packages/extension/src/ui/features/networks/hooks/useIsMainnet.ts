import { selectedNetworkIdView } from "../../../views/network"
import { useView } from "../../../views/implementation/react"

export const useIsMainnet = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  return selectedNetworkId === "mainnet-alpha"
}
