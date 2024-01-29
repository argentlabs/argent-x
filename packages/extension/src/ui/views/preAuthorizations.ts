import { getAccountIdentifier } from "@argent/shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { groupBy } from "lodash-es"

import {
  PreAuthorization,
  isEqualPreAuthorization,
} from "../../shared/preAuthorization/schema"
import { preAuthorizationRepo } from "../../shared/preAuthorization/store"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFromRepo } from "./implementation/atomFromRepo"

/**
 * @internal use `allPreAuthorizationsView` instead
 */
const allPreAuthorizationsAtom = atomFromRepo(preAuthorizationRepo)

export const allPreAuthorizationsView = atom(async (get) => {
  const all = await get(allPreAuthorizationsAtom)
  return all
})

export const preAuthorizationsGroupedByAccountIdentifierForNetworkId =
  atomFamily((networkId: string) => {
    return atom(async (get) => {
      const all = await get(preAuthorizationsForNetworkId(networkId))
      const grouped = groupBy(all, (preAuthorization) =>
        getAccountIdentifier(preAuthorization.account),
      )
      return grouped
    })
  })

export const preAuthorizationsForNetworkId = atomFamily((networkId: string) => {
  return atom(async (get) => {
    const all = await get(allPreAuthorizationsView)
    const filtered = all.filter(
      (preAuthorization) => networkId === preAuthorization.account.networkId,
    )
    return filtered
  })
})

export const preAuthorizationsForAccount = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const all = await get(allPreAuthorizationsView)
      const filtered = all.filter((preAuthorization) =>
        accountsEqual(preAuthorization.account, account),
      )
      return filtered
    })
  },
  (a, b) => accountsEqual(a, b),
)

export const isPreauthorized = atomFamily(
  (maybePreAuthorization: Partial<PreAuthorization>) => {
    return atom(async (get) => {
      const all = await get(allPreAuthorizationsView)
      const result = all.some((preAuthorization) =>
        isEqualPreAuthorization(maybePreAuthorization, preAuthorization),
      )
      return result
    })
  },
  (a, b) => isEqualPreAuthorization(a, b),
)
