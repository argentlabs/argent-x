import { isEqualAddress } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { activityCacheStore } from "../../shared/activity/cache/storage"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFromStore } from "./implementation/atomFromStore"
import { NativeActivityTypeNative } from "@argent/x-shared/simulation"
import { atomWithDebugLabel } from "./atomWithDebugLabel"

export const activityCacheStoreView = atomFromStore(activityCacheStore)

export const activityCacheItemForAccountView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        if (!account) {
          return
        }
        const activityCacheStore = await get(activityCacheStoreView)
        const { cache: activityCache } = activityCacheStore
        return activityCache[account.id]
      }),
      `activityCacheItemForAccountView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

export const activityForAccountView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
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
      }),
      `activityForAccountView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

export const executeFromOutsidePendingActivityForAccountView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        if (!account) {
          return
        }
        const activityCacheItem = await get(
          activityCacheItemForAccountView(account),
        )
        if (!activityCacheItem) {
          return
        }
        return activityCacheItem.activities.filter(
          (activity) =>
            activity.type === NativeActivityTypeNative &&
            activity.meta?.isExecuteFromOutside &&
            activity.status === "pending",
        )
      }),
      `executeFromOutsidePendingActivityForAccountView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

export const activityForTransactionHashView = atomFamily(
  ({ account, hash }: { account?: BaseWalletAccount; hash?: string }) =>
    atomWithDebugLabel(
      atom(async (get) => {
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
      }),
      `activityForTransactionHashView-${account?.id || "unknown"}-${hash || "unknown"}`,
    ),
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
