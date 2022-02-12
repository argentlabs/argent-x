import create from "zustand"
import { persist } from "zustand/middleware"

import { Wallet } from "../Wallet"

interface AccountStore {
  wallets: Record<string, Wallet>
  accountNames: Record<string, any>
  selectedWallet?: string
  addWallet: (newWallet: Wallet) => void
  setWalletName: (netowrkId: string, address: string, name: string) => void
}

export const useAccount = create<AccountStore>(
  persist(
    (set, get) => ({
      wallets: {},
      accountNames: {},
      addWallet: (newWallet: Wallet) =>
        set((state) => ({
          selectedWallet: newWallet.address,
          wallets: {
            ...state.wallets,
            [newWallet.address]: newWallet,
          },
        })),
      setWalletName: (networkId: string, address: string, name?: string) =>
        set((state) => {
          console.log(
            "setWalletName address: string, name?: string",
            address,
            name,
          )
          const wallet: Wallet = state.wallets[address]
          wallet.name = name
            ? name
            : getDefaultAccountName(calcAccountNumber(state.wallets, address))
          let networkAccounts = state.accountNames[networkId]
          if (!networkAccounts) {
            networkAccounts = {}
          }
          return {
            wallets: {
              ...state.wallets,
              [address]: wallet,
            },
            accountNames: {
              ...state.accountNames,
              [networkId]: {
                ...state.accountNames[networkId],
                [address]: name,
              },
            },
          }
        }),
    }),
    {
      name: "accountNames", // name of item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        accountNames: {
          ...currentState.accountNames,
          ...persistedState.accountNames,
        },
      }),
    },
  ),
)

const getAccountName = (
  networkId: string,
  address: string,
): string | undefined => {
  return useAccount.getState().accountNames?.[networkId]?.[address]
}

export const setWalletsFromBackup = (wallets: Record<string, Wallet>) => {
  console.log("start setWalletsFromBackup wallets", wallets)
  Object.keys(wallets).forEach((address: string) => {
    const wallet = wallets[address]
    wallet.name = getAccountName(wallet.networkId, wallet.address)
    if (!wallet.name) {
      wallet.name = getDefaultAccountName(calcAccountNumber(wallets, address))
    }
  })
  console.log("end setWalletsFromBackup wallets", wallets)
}

export const selectWallet = ({ wallets, selectedWallet }: AccountStore) => {
  if (selectedWallet) {
    return wallets[selectedWallet]
  }
}

const getDefaultAccountName = (accountNumber: number) =>
  `Account ${accountNumber}`

export const selectAccountNumber = ({
  wallets,
  selectedWallet,
}: AccountStore) => calcAccountNumber(wallets, selectedWallet)

const calcAccountNumber = (
  wallets: Record<string, Wallet>,
  accountAddress: string | undefined,
): number => {
  return (
    Object.keys(wallets).findIndex((address) => address === accountAddress) + 1
  )
}
