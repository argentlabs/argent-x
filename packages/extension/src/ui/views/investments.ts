import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import {
  accountsEqualByAddress,
  atomFamilyAccountsEqual,
} from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { isEqual } from "lodash-es"
import { atomWithDebugLabel } from "./atomWithDebugLabel"
import { atomFromRepo } from "./implementation/atomFromRepo"
import {
  investmentByPositionIdRepo,
  investmentRepo,
} from "../../shared/investments/repository"
import { atomFromKeyValueStore } from "./implementation/atomFromKeyValueStore"

export const allInvestmentsViews = atomFromRepo(investmentRepo)

export const investmentViewFindAtom = atomFamily(
  (baseAccount?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const investments = await get(allInvestmentsViews)
        return investments.find((i) => accountsEqualByAddress(i, baseAccount))
      }),
      `investmentViewFindAtom-${baseAccount?.address}`,
    ),
  atomFamilyAccountsEqual,
)

export const investmentViewFindAtomByNetworkId = atomFamily(
  (networkId?: string) =>
    atomWithDebugLabel(
      atom(async (get) => {
        if (!networkId) {
          return []
        }

        const investments = await get(allInvestmentsViews)
        return investments.filter((i) => i.networkId === networkId)
      }),
      `investmentViewFindAtomByNetworkId-${networkId}`,
    ),
)

export interface AccountAndPositionIdFamily {
  account?: BaseWalletAccount
  positionId?: string
}

export const parsedPositionByIdAtom = atomFamily(
  (positionId: string) =>
    atomFromKeyValueStore(investmentByPositionIdRepo, positionId),
  isEqual,
)

export const investmentPositionViewFindByIdAtom = atomFamily(
  ({ positionId }: AccountAndPositionIdFamily) =>
    atomWithDebugLabel(
      atom(async (get) => {
        if (!positionId) {
          return
        }
        const parsedPosition = await get(parsedPositionByIdAtom(positionId))
        return parsedPosition
      }),
      `investmentPositionViewFindByIdAtom-${positionId}`,
    ),
  (a, b) => a.positionId === b.positionId,
)
