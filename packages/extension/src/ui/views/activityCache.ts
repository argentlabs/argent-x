import { isEqualAddress } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { activityCacheStore } from "../../shared/activity/cache/storage"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFromStore } from "./implementation/atomFromStore"

export const activityCacheStoreView = atomFromStore(activityCacheStore)

export const activityCacheItemForAccountView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      if (!account) {
        return
      }
      const activityCacheStore = await get(activityCacheStoreView)
      const { cache: activityCache } = activityCacheStore
      return activityCache[account.id]
    })
  },
  atomFamilyAccountsEqual,
)

export const activityForAccountView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      if (!account) {
        return
      }
      const activityCacheItem = await get(
        activityCacheItemForAccountView(account),
      )
      if (!activityCacheItem) {
        return
      }
      return activityCacheItem.activities
    })
  },
  atomFamilyAccountsEqual,
)

export const activityForTransactionHashView = atomFamily(
  ({ account, hash }: { account?: BaseWalletAccount; hash?: string }) => {
    return atom(async (get) => {
      if (!account || !hash) {
        return
      }
      const activityForAccount = await get(activityForAccountView(account))
      if (!activityForAccount) {
        return
      }
      return activityForAccount.find((activity) =>
        isEqualAddress(hash, activity.transaction.hash),
      )
    })
  },
  (a, b) => {
    if (!a.hash && !b.hash) {
      return true
    }
    return (
      atomFamilyAccountsEqual(a?.account, b?.account) &&
      isEqualAddress(a?.hash, b?.hash)
    )
  },
)
