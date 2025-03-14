import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { groupBy } from "lodash-es"

import type { PreAuthorization } from "../../shared/preAuthorization/schema"
import { isEqualPreAuthorization } from "../../shared/preAuthorization/schema"
import { preAuthorizationRepo } from "../../shared/preAuthorization/store"
import {
  accountsEqual,
  atomFamilyAccountsEqual,
} from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomWithDebugLabel } from "./atomWithDebugLabel"

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
    return atomWithDebugLabel(
      atom(async (get) => {
        const all = await get(preAuthorizationsForNetworkId(networkId))
        const grouped = groupBy(all, ({ account }) => account.id)
        return grouped
      }),
      `preAuthorizationsGroupedByAccountIdentifierForNetworkId-${networkId}`,
    )
  })

export const preAuthorizationsForNetworkId = atomFamily((networkId: string) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const all = await get(allPreAuthorizationsView)
      const filtered = all.filter(
        (preAuthorization) => networkId === preAuthorization.account.networkId,
      )
      return filtered
    }),
    `preAuthorizationsForNetworkId-${networkId}`,
  )
})

export const preAuthorizationsForAccount = atomFamily(
  (account?: BaseWalletAccount) => {
    return atomWithDebugLabel(
      atom(async (get) => {
        const all = await get(allPreAuthorizationsView)
        const filtered = all.filter((preAuthorization) =>
          accountsEqual(preAuthorization.account, account),
        )
        return filtered
      }),
      `preAuthorizationsForAccount-${account?.id}`,
    )
  },
  atomFamilyAccountsEqual,
)

export const isPreauthorized = atomFamily(
  (maybePreAuthorization: Partial<PreAuthorization>) => {
    return atomWithDebugLabel(
      atom(async (get) => {
        const all = await get(allPreAuthorizationsView)
        const result = all.some((preAuthorization) =>
          isEqualPreAuthorization(maybePreAuthorization, preAuthorization),
        )
        return result
      }),
      `isPreauthorized-${maybePreAuthorization?.account?.id}`,
    )
  },
  isEqualPreAuthorization,
)
