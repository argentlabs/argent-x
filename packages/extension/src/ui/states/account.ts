import create from "zustand"

import { Wallet } from "../Wallet"

interface AccountStore {
  wallets: Record<string, Wallet>
  selectedWallet?: string
  addWallet: (newWallet: Wallet) => void
}

export const useAccount = create<AccountStore>((set) => ({
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

export const selectWallet = ({ wallets, selectedWallet }: AccountStore) => {
  if (selectedWallet) {
    return wallets[selectedWallet]
  }
}

export const selectAccountNumber = ({
  wallets,
  selectedWallet,
}: AccountStore) =>
  Object.keys(wallets).findIndex((wallet) => wallet === selectedWallet) + 1
