import { defaultNetwork } from "../../../../shared/network"
import { useView } from "../../../views/implementation/react"
import { selectedNetworkIdView } from "../../../views/network"

export const useIsDefaultNetwork = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  return selectedNetworkId === defaultNetwork.id
}
