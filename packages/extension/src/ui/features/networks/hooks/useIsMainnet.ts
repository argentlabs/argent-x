import { useAppState } from "../../../app.state"

export const useIsMainnet = () => {
  const { switcherNetworkId } = useAppState()
  return switcherNetworkId === "mainnet-alpha"
}
