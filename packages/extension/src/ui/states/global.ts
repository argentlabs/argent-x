import create from "zustand"

import { ExtActionItem } from "../../shared/actionQueue"
import { defaultNetwork } from "../../shared/networks"
import { TokenDetails } from "../utils/tokens"
import { Wallet } from "../Wallet"

interface GlobalStore {
  wallets: Record<string, Wallet>
  networkId: string
  localhostPort: number
  selectedWallet?: string
  selectedToken?: TokenDetails
  uploadedBackup?: string
  actions: ExtActionItem[]
  isPopup?: boolean
  txHash?: string
  error?: string
  showLoading: boolean
  addWallet: (newWallet: Wallet) => void
}

export const useGlobalState = create<GlobalStore>((set) => ({
  wallets: {},
  networkId: defaultNetwork.id,
  localhostPort: (() => {
    const port = parseInt(localStorage.port)
    return !port || isNaN(port) ? 5000 : port
  })(),
  actions: [],
  isPopup: new URLSearchParams(window.location.search).has("popup"),
  showLoading: false,
  addWallet: (newWallet: Wallet) =>
    set((state) => ({
      selectedWallet: newWallet.address,
      wallets: {
        ...state.wallets,
        [newWallet.address]: newWallet,
      },
    })),
}))

export const selectWallet = ({ wallets, selectedWallet }: GlobalStore) => {
  if (!selectedWallet) {
    throw new Error("No selected wallet")
  }
  return wallets[selectedWallet]
}

export const selectAccountNumber = ({ wallets, selectedWallet }: GlobalStore) =>
  Object.keys(wallets).findIndex((wallet) => wallet === selectedWallet) + 1
