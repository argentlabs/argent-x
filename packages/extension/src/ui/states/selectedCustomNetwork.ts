import create from "zustand"

import { CustomNetwork } from "../../shared/customNetworks"

interface State {
  selectedCustomNetwork?: CustomNetwork
  setSelectedCustomNetwork: (selectedCustomNetwork?: CustomNetwork) => void
}

const useSelectedCustomNetworkStore = create<State>((set) => ({
  selectedCustomNetwork: undefined,
  setSelectedCustomNetwork: (selectedCustomNetwork) =>
    set({
      selectedCustomNetwork,
    }),
}))

export const useSelectedCustomNetwork = () =>
  [
    useSelectedCustomNetworkStore((state) => state.selectedCustomNetwork),
    useSelectedCustomNetworkStore((state) => state.setSelectedCustomNetwork),
  ] as const
