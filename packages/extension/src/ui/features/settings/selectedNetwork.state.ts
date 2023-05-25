import { create } from "zustand"

import { Network } from "../../../shared/network"

interface State {
  selectedNetwork?: Network
  setSelectedNetwork: (selectedNetwork?: Network) => void
}

const useSelectedNetworkStore = create<State>()((set) => ({
  selectedNetwork: undefined,
  setSelectedNetwork: (selectedNetwork) =>
    set({
      selectedNetwork,
    }),
}))

export const useSelectedNetwork = () =>
  [
    useSelectedNetworkStore((state) => state.selectedNetwork),
    useSelectedNetworkStore((state) => state.setSelectedNetwork),
  ] as const
