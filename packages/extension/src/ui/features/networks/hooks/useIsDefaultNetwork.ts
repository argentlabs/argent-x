import { defaultNetwork } from "../../../../shared/network"
import { useAppState } from "../../../app.state"

export const useIsDefaultNetwork = () => {
  const { switcherNetworkId } = useAppState()
  return switcherNetworkId === defaultNetwork.id
}
