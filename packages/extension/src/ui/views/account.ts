import { Atom, atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { accountRepo } from "../../shared/account/store"
import { BaseWalletAccount, WalletAccount } from "../../shared/wallet.model"
import { accountsEqual, isAccountHidden } from "../../shared/wallet.service"
import { walletStore } from "../../shared/wallet/walletStore"
import { accountHasEscape } from "../features/shield/escape/useAccountEscape"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomFromStore } from "./implementation/atomFromStore"

// Accounts repo views

/**
 * @internal use `accountsView` instead
 */
const unsafe_allAccountsView = atomFromRepo(accountRepo)

export const allAccountsView = atom(async (get) => {
  const accounts = await get(unsafe_allAccountsView)
  return accounts.filter((account) => account.network !== undefined)
})

export const visibleAccountsView = atom(async (get) => {
  const accounts = await get(allAccountsView)
  return accounts.filter((account) => !isAccountHidden(account))
})

export const hiddenAccountsView = atom(async (get) => {
  const accounts = await get(allAccountsView)
  return accounts.filter(isAccountHidden)
})

export const allAccountsWithEscapeView = atom(async (get) => {
  const accounts = await get(allAccountsView)
  return accounts.filter((account) => accountHasEscape(account))
})

const accountsOnNetworkFamilyFactory = (view: Atom<Promise<WalletAccount[]>>) =>
  atomFamily(
    (networkId: string) =>
      atom(async (get) => {
        const accounts = await get(view)
        return accounts.filter((account) => account.networkId === networkId)
      }),
    (a, b) => a === b,
  )

export const visibleAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(visibleAccountsView)

export const allAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(allAccountsView)

export const hiddenAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(hiddenAccountsView)

export const accountFindFamily = atomFamily(
  (baseAccount: BaseWalletAccount) =>
    atom(async (get) => {
      const accounts = await get(allAccountsView)
      return accounts.find((account) => accountsEqual(account, baseAccount))
    }),
  (a, b) => accountsEqual(a, b),
)

// Account store views (selected etc)

/**
 * @internal use `selectedBaseAccountView` instead
 */
export const walletStoreAtom = atomFromStore(walletStore)

export const selectedBaseAccountView = atom(async (get) => {
  const walletStore = await get(walletStoreAtom)
  return walletStore.selected ?? null
})

// Combined views, eg the full selected account
export const selectedAccountView = atom(async (get) => {
  const selectedBaseAccount = await get(selectedBaseAccountView)
  const accounts = await get(visibleAccountsView)

  return accounts.find(
    (account) =>
      selectedBaseAccount && accountsEqual(account, selectedBaseAccount),
  )
})
