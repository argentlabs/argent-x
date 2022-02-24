import create from "zustand"

import { Wallet } from "../Wallet"

interface State {
  wallets: Record<string, Wallet>
  selectedWallet?: string
  addWallet: (newWallet: Wallet) => void
}

export const useAccount = create<State>((set) => ({
  wallets: {},
  addWallet: (newWallet: Wallet) =>
    set((state) => ({
      selectedWallet: newWallet.address,
      wallets: {
        ...state.wallets,
        [newWallet.address]: newWallet,
      },
    })),
}))

export const selectAccount = ({ wallets, selectedWallet }: State) => {
  if (selectedWallet) {
    return wallets[selectedWallet]
  }
}
