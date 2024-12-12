import { ensureArray } from "@argent/x-shared"
import type { Atom } from "jotai"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { accountRepo } from "../../shared/account/store"
import type { AccountId, WalletAccount } from "../../shared/wallet.model"
import { isNetworkOnlyPlaceholderAccount } from "../../shared/wallet.model"
import { isAccountHidden } from "../../shared/wallet.service"
import {
  accountsEqual,
  isEqualAccountIds,
  atomFamilyIsEqualAccountIds,
} from "./../../shared/utils/accountsEqual"
import { walletStore } from "../../shared/wallet/walletStore"
import { accountHasEscape } from "../features/smartAccount/escape/accountHasEscape"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomFromStore } from "./implementation/atomFromStore"
import { hasSavedRecoverySeedphraseAtom } from "../features/recovery/hasSavedRecoverySeedphraseAtom"

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

export const allAccountsWithGuardianView = atom(async (get) => {
  const accounts = await get(allAccountsView)
  return accounts.filter((account) => Boolean(account.guardian))
})

const accountsOnNetworkFamilyFactory = (view: Atom<Promise<WalletAccount[]>>) =>
  atomFamily(
    (networkId?: string) => {
      return atom(async (get) => {
        const accounts = await get(view)
        return accounts.filter((account) => account.networkId === networkId)
      })
    },
    (a, b) => a === b,
  )

const accountsWithEscapeOnNetworkFamilyFactory = (
  view: Atom<Promise<WalletAccount[]>>,
) =>
  atomFamily(
    (networkId?: string) =>
      atom(async (get) => {
        const accounts = await get(view)
        return accounts.filter(
          (account) =>
            account.networkId === networkId && accountHasEscape(account),
        )
      }),
    (a, b) => a === b,
  )

export const visibleAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(visibleAccountsView)

export const allAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(allAccountsView)

export const allAccountsWithEscapeOnNetworkFamily =
  accountsWithEscapeOnNetworkFamilyFactory(allAccountsWithEscapeView)

export const hiddenAccountsOnNetworkFamily =
  accountsOnNetworkFamilyFactory(hiddenAccountsView)

export const accountFindFamily = atomFamily(
  (accountId?: AccountId) =>
    atom(async (get) => {
      const accounts = await get(allAccountsView)
      return accounts.find((account) =>
        isEqualAccountIds(account.id, accountId),
      )
    }),
  atomFamilyIsEqualAccountIds,
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
  if (
    !selectedBaseAccount ||
    isNetworkOnlyPlaceholderAccount(selectedBaseAccount)
  ) {
    return
  }
  const accounts = await get(visibleAccountsView)

  return accounts.find(
    (account) =>
      selectedBaseAccount && accountsEqual(account, selectedBaseAccount),
  )
})

export const needsToSaveRecoverySeedphraseView = atom(async (get) => {
  const account = await get(selectedAccountView)
  const hasSavedRecoverySeedphrase = await get(hasSavedRecoverySeedphraseAtom)
  return account?.signer?.type !== "ledger" && !hasSavedRecoverySeedphrase
})

export const noUpgradeBannerAccountsView = atom(async (get) => {
  const walletStore = await get(walletStoreAtom)
  return ensureArray(walletStore.noUpgradeBannerAccounts)
})
