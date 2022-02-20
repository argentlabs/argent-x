import create from "zustand"
import { persist } from "zustand/middleware"

import { Wallet } from "../Wallet"

interface AccountStore {
  wallets: Record<string, Wallet>
  accountNames: Record<string, any>
  selectedWallet?: string
  addWallet: (newWallet: Wallet) => void
  setAccountName: (netowrkId: string, address: string, name: string) => void
}

export const useAccount = create<AccountStore>(
  persist(
    (set, get) => ({
      wallets: {},
      accountNames: {},
      addWallet: (newWallet: Wallet) => {
        if (newWallet.name === undefined) {
          newWallet.name = getDefaultAccountName(
            Object.keys(get().wallets).length + 1,
          )
        }
        set((state) => ({
          selectedWallet: newWallet.address,
          wallets: {
            ...state.wallets,
            [newWallet.address]: newWallet,
          },
        }))
      },
      setAccountName: (networkId: string, address: string, name?: string) =>
        set((state) => {
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
      name: "account",
      // only save state.accountNames to local storage
      partialize: (state) => ({ accountNames: state.accountNames }),
      getStorage: () => localStorage,
      merge: (persistedState, currentState) => ({
        ...currentState,
        accountNames: {
          ...currentState.accountNames,
          // only load state.accountNames from local storage
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

/**
 * Sets account names saved in local storage or given a default name
 */
export const setAccountNamesFromBackup = (wallets: Record<string, Wallet>) => {
  Object.keys(wallets).forEach((address: string) => {
    const wallet = wallets[address]
    wallet.name = getAccountName(wallet.networkId, wallet.address)
    if (!wallet.name) {
      wallet.name = getDefaultAccountName(calcAccountNumber(wallets, address))
    }
  })
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

export const selectAccount = ({ wallets, selectedWallet }: AccountStore) => {
  return selectedWallet ? wallets[selectedWallet] : undefined
}

const calcAccountNumber = (
  wallets: Record<string, Wallet>,
  accountAddress: string | undefined,
): number => {
  return (
    Object.keys(wallets).findIndex((address) => address === accountAddress) + 1
  )
}
