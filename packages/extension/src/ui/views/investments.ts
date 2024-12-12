import { isEqualAddress, type DefiPositionType } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { computeCollateralizedDebtBorrowingPositionUsdValue } from "../../shared/defiDecomposition/helpers/computeCollateralizedDebtPositionsUsdValue"
import { computeConcentratedLiquidityPositionUsdValue } from "../../shared/defiDecomposition/helpers/computeConcentratedLiquidityPositionsUsdValue"
import { computeDefiDecompositionUsdValue } from "../../shared/defiDecomposition/helpers/computeDefiDecompositionUsdValue"
import { computeDelegatedTokensPositionUsdValue } from "../../shared/defiDecomposition/helpers/computeDelegatedTokensPositionsUsdValue"
import { computeStakingPositionUsdValue } from "../../shared/defiDecomposition/helpers/computeStakingPositionsUsdValue"
import { computeStrkDelegatedStakingPositionUsdValue } from "../../shared/defiDecomposition/helpers/computeStrkDelegatedStakingPositionsUsdValue"
import type {
  ParsedPosition,
  PositionBaseToken,
} from "../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../shared/defiDecomposition/schema"
import { argentDb } from "../../shared/idb/argentDb"
import { equalToken } from "../../shared/token/__new/utils"
import {
  accountsEqualByAddress,
  atomFamilyAccountsEqual,
} from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import {
  tokensFindFamily,
  tokensInNetwork,
} from "../features/accountTokens/tokens.state"
import { atomFromQuery } from "./implementation/atomFromQuery"
import { allTokenPricesView, allTokensView } from "./token"
import { uniqWith } from "lodash-es"
import { getPositionTokenBalance } from "../../shared/defiDecomposition/getPositionTokenBalance"
import { visibleAccountsOnNetworkFamily } from "./account"

export const allInvestmentsViews = atomFromQuery(() =>
  argentDb.investments.toArray(),
)

export const investmentViewFindAtom = atomFamily(
  (baseAccount?: BaseWalletAccount) =>
    atom(async (get) => {
      const investments = await get(allInvestmentsViews)
      return investments.find((i) => accountsEqualByAddress(i, baseAccount))
    }),
  atomFamilyAccountsEqual,
)

export const investmentViewFindAtomByNetworkId = atomFamily(
  (networkId?: string) =>
    atom(async (get) => {
      if (!networkId) {
        return []
      }

      const investments = await get(allInvestmentsViews)
      return investments.filter((i) => i.networkId === networkId)
    }),
  (a, b) => a === b,
)

export const investmentTypeViewFindAtom = atomFamily(
  (investmentType?: DefiPositionType) =>
    atom(async (get) => {
      if (!investmentType) {
        return
      }

      const investments = await get(allInvestmentsViews)
      return investments.filter(({ defiDecomposition }) =>
        defiDecomposition
          .flatMap(({ products }) => products)
          .some((product) => product.type === investmentType),
      )
    }),
  (a, b) => a === b,
)

interface AccountAndInvestmentTypeFamily {
  account?: BaseWalletAccount
  investmentType?: DefiPositionType
}

export const investmentTypeViewFindForAccountAtom = atomFamily(
  ({ account, investmentType }: AccountAndInvestmentTypeFamily) =>
    atom(async (get) => {
      if (!account || !investmentType) {
        return
      }
      const investments = await get(allInvestmentsViews)
      return investments.find(
        ({ address, networkId, defiDecomposition }) =>
          accountsEqualByAddress({ address, networkId }, account) &&
          defiDecomposition
            .flatMap(({ products }) => products)
            .some((product) => product.type === investmentType),
      )
    }),
  (a, b) =>
    atomFamilyAccountsEqual(a?.account, b?.account) &&
    a?.investmentType === b?.investmentType,
)

export interface AccountAndPositionIdFamily {
  account?: BaseWalletAccount
  positionId?: string
}

export const investmentPositionViewFindByIdAtom = atomFamily(
  ({ account, positionId }: AccountAndPositionIdFamily) =>
    atom(async (get) => {
      if (!account || !positionId) {
        return
      }
      const accountInvestment = await get(investmentViewFindAtom(account))
      if (!accountInvestment) {
        return
      }

      return accountInvestment.defiDecomposition
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .find((position) => position.id === positionId)
    }),
  (a, b) =>
    atomFamilyAccountsEqual(a.account, b.account) &&
    a.positionId === b.positionId,
)

export const investmentPositionUsdValueViewFindByIdAtom = atomFamily(
  ({ account, positionId }: AccountAndPositionIdFamily) =>
    atom(async (get) => {
      if (!account || !positionId) {
        return
      }
      const position = await get(
        investmentPositionViewFindByIdAtom({ account, positionId }),
      )
      if (!position) {
        return
      }

      const tokens = await get(tokensInNetwork(account.networkId))
      const tokenPrices = await get(allTokenPricesView)

      if (isStakingPosition(position)) {
        return computeStakingPositionUsdValue(position, tokens, tokenPrices)
      } else if (isConcentratedLiquidityPosition(position)) {
        return computeConcentratedLiquidityPositionUsdValue(
          position,
          tokens,
          tokenPrices,
        )
      } else if (isCollateralizedDebtBorrowingPosition(position)) {
        return computeCollateralizedDebtBorrowingPositionUsdValue(
          position,
          tokens,
          tokenPrices,
        )
      } else if (isStrkDelegatedStakingPosition(position)) {
        return computeStrkDelegatedStakingPositionUsdValue(
          position,
          tokens,
          tokenPrices,
        )
      } else if (isDelegatedTokensPosition(position)) {
        return computeDelegatedTokensPositionUsdValue(
          position,
          tokens,
          tokenPrices,
        )
      }
    }),
  (a, b) =>
    atomFamilyAccountsEqual(a.account, b.account) &&
    a.positionId === b.positionId,
)

export const defiDecompositionWithUsdValueAtom = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      if (!account) {
        return
      }
      const investments = await get(allInvestmentsViews)
      const tokens = await get(tokensInNetwork(account.networkId))
      const tokenPrices = await get(allTokenPricesView)

      const accountInvestment = investments.find((i) =>
        accountsEqualByAddress(i, account),
      )
      if (!accountInvestment) {
        return
      }

      return computeDefiDecompositionUsdValue(
        accountInvestment.defiDecomposition,
        tokens,
        tokenPrices,
      )
    })
  },
  atomFamilyAccountsEqual,
)

export const positionTitleFindAtom = atomFamily(
  (position: ParsedPosition) =>
    atom(async (get) => {
      const unknownLabel = "Unknown"
      const allTokens = await get(allTokensView)

      const findToken = (baseToken: PositionBaseToken) =>
        allTokens.find((token) => equalToken(token, baseToken))

      if (
        isDelegatedTokensPosition(position) ||
        isCollateralizedDebtLendingPosition(position)
      ) {
        const token = findToken(position.token)
        return token?.name ?? unknownLabel
      }

      if (isConcentratedLiquidityPosition(position)) {
        const [token0, token1] = [
          findToken(position.token0),
          findToken(position.token1),
        ]
        const symbol0 = token0?.symbol ?? unknownLabel
        const symbol1 = token1?.symbol ?? unknownLabel
        return `${symbol0}, ${symbol1}`
      }

      if (isCollateralizedDebtBorrowingPosition(position)) {
        const { debtPositions } = position
        if (debtPositions.length === 1) {
          const token = findToken(debtPositions[0].token)
          return token?.name ?? unknownLabel
        }
        if (debtPositions.length === 2) {
          const [token0, token1] = [
            findToken(debtPositions[0].token),
            findToken(debtPositions[1].token),
          ]
          const symbol0 = token0?.symbol ?? unknownLabel
          const symbol1 = token1?.symbol ?? unknownLabel
          return `${symbol0}, ${symbol1}`
        }
        return `${debtPositions.length} assets`
      }

      if (
        isStrkDelegatedStakingPosition(position) ||
        isStakingPosition(position)
      ) {
        const token = findToken(position.token)
        return `Staking ${token?.symbol ?? unknownLabel}`
      }

      return unknownLabel
    }),
  (a, b) => a.id === b.id,
)

export const positionTitleDetailsFindAtom = atomFamily(
  (position: ParsedPosition) => {
    return atom(async (get) => {
      const positionTitle = await get(positionTitleFindAtom(position))
      if (isCollateralizedDebtBorrowingPosition(position)) {
        return `Borrowing ${positionTitle}`
      } else if (isCollateralizedDebtLendingPosition(position)) {
        return `Lending ${positionTitle}`
      } else if (
        isStakingPosition(position) ||
        isStrkDelegatedStakingPosition(position)
      ) {
        const token = await get(tokensFindFamily(position.token))
        return `Staking ${token?.symbol ?? "Unknown"}`
      } else if (isDelegatedTokensPosition(position)) {
        return `Delegated ${positionTitle}`
      } else if (isConcentratedLiquidityPosition(position)) {
        return `Providing liquidity ${positionTitle}`
      } else {
        return positionTitle
      }
    })
  },
  (a, b) => a.id === b.id,
)

export const defiDecompositionTokensViewAtom = atomFamily(
  (baseAccount?: BaseWalletAccount) =>
    atom(async (get) => {
      const investments = await get(allInvestmentsViews)
      const accountInvestments = investments.find((i) =>
        accountsEqualByAddress(i, baseAccount),
      )
      if (!accountInvestments) {
        return
      }
      const tokens = accountInvestments.defiDecomposition
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .flatMap((position) => {
          if (isConcentratedLiquidityPosition(position)) {
            return [position.token0, position.token1]
          }
          if (isCollateralizedDebtBorrowingPosition(position)) {
            return [
              ...position.collateralizedPositions.map((p) => p.token),
              ...position.debtPositions.map((p) => p.token),
            ]
          }

          return [position.token]
        })
        .map((token) => ({
          address: token.address,
          networkId: token.networkId,
        }))

      // Filter tokens to ensure uniqueness
      const uniqueTokens = uniqWith(tokens, equalToken)

      return uniqueTokens
    }),
  atomFamilyAccountsEqual,
)

const getPositionTokenBalanceForAcc =
  (baseAccount: BaseWalletAccount) => (token: PositionBaseToken) =>
    getPositionTokenBalance(baseAccount, token)

export const defiDecompositionTokenBalancesViewAtom = atomFamily(
  (baseAccount?: BaseWalletAccount) =>
    atom(async (get) => {
      if (!baseAccount) {
        return []
      }
      const investments = await get(allInvestmentsViews)
      const accountInvestments = investments.find((i) =>
        accountsEqualByAddress(i, baseAccount),
      )

      if (!accountInvestments) {
        return []
      }

      const getPTokenBalanceForAcc = getPositionTokenBalanceForAcc(baseAccount)

      const tokenBalances = accountInvestments.defiDecomposition
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .flatMap((position) => {
          if (isConcentratedLiquidityPosition(position)) {
            return [
              getPTokenBalanceForAcc(position.token0),
              getPTokenBalanceForAcc(position.token1),
            ]
          }
          if (isCollateralizedDebtBorrowingPosition(position)) {
            return [
              ...position.collateralizedPositions.map((p) =>
                getPTokenBalanceForAcc(p.token),
              ),
              ...position.debtPositions.map((p) => {
                const positionTokenBalance = getPTokenBalanceForAcc(p.token)
                return {
                  ...positionTokenBalance,
                  balance: `-${positionTokenBalance.balance}`, // debt position, we need negative balance
                }
              }),
            ]
          }

          return [getPTokenBalanceForAcc(position.token)]
        })

      return tokenBalances
    }),
  atomFamilyAccountsEqual,
)

export const defiDecompositionTokenBalancesForNetworkViewAtom = atomFamily(
  (networkId?: string) =>
    atom(async (get) => {
      if (!networkId) {
        return []
      }

      const investments = await get(
        investmentViewFindAtomByNetworkId(networkId),
      )

      const visibleAccounts = await get(
        visibleAccountsOnNetworkFamily(networkId),
      )

      const tokenBalances = investments.flatMap(
        ({ address, defiDecomposition }) =>
          defiDecomposition
            .flatMap(({ products }) => products)
            .flatMap(({ positions }) => positions)
            .flatMap((position) => {
              const acc = visibleAccounts.find(
                (a) =>
                  isEqualAddress(a.address, address) &&
                  a.networkId === networkId,
              )

              if (!acc) {
                return []
              }

              const getPTokenBalanceForAcc = getPositionTokenBalanceForAcc(acc)

              if (isConcentratedLiquidityPosition(position)) {
                return [
                  getPTokenBalanceForAcc(position.token0),
                  getPTokenBalanceForAcc(position.token1),
                ]
              }
              if (isCollateralizedDebtBorrowingPosition(position)) {
                return [
                  ...position.collateralizedPositions.map((p) =>
                    getPTokenBalanceForAcc(p.token),
                  ),
                  ...position.debtPositions.map((p) => {
                    const positionTokenBalance = getPTokenBalanceForAcc(p.token)
                    return {
                      ...positionTokenBalance,
                      balance: `-${positionTokenBalance.balance}`, // debt position, we need negative balance
                    }
                  }),
                ]
              }

              return [getPTokenBalanceForAcc(position.token)]
            }),
      )

      return tokenBalances
    }),
  (a, b) => a === b,
)

export const liquidityTokensView = atomFamily(
  (baseAccount?: BaseWalletAccount) =>
    atom(async (get) => {
      const accountInvestments = await get(investmentViewFindAtom(baseAccount))
      if (!accountInvestments) {
        return []
      }

      const tokens = accountInvestments.defiDecomposition
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .flatMap((position) => {
          if (isStrkDelegatedStakingPosition(position)) {
            return []
          }

          if (isCollateralizedDebtBorrowingPosition(position)) {
            return [
              ...position.collateralizedPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
              ...position.debtPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
            ]
          }

          return position.liquidityToken ? [position.liquidityToken] : []
        })

      return uniqWith(tokens, equalToken)
    }),
  atomFamilyAccountsEqual,
)

export const liquidityTokensForPositionView = atomFamily(
  ({
    account,
    position,
  }: {
    account: BaseWalletAccount
    position: ParsedPosition
  }) =>
    atom(async (get) => {
      const accountInvestments = await get(investmentViewFindAtom(account))
      if (!accountInvestments) {
        return []
      }

      const tokens = accountInvestments.defiDecomposition
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .filter((p) => p.id === position.id)
        .flatMap((defiPosition) => {
          if (isStrkDelegatedStakingPosition(defiPosition)) {
            return []
          }

          if (isCollateralizedDebtBorrowingPosition(defiPosition)) {
            return [
              ...defiPosition.collateralizedPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
              ...defiPosition.debtPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
            ]
          }

          return defiPosition.liquidityToken
            ? [defiPosition.liquidityToken]
            : []
        })

      return uniqWith(tokens, equalToken)
    }),
  (a, b) =>
    atomFamilyAccountsEqual(a.account, b.account) &&
    a.position.id === b.position.id,
)

export const liquidityTokensInNetworkView = atomFamily(
  (networkId?: string) =>
    atom(async (get) => {
      const accountInvestments = await get(
        investmentViewFindAtomByNetworkId(networkId),
      )
      if (!accountInvestments) {
        return []
      }

      const tokens = accountInvestments
        .filter((d) => d.networkId === networkId) // just to be safe
        .flatMap(({ defiDecomposition }) => defiDecomposition)
        .flatMap(({ products }) => products)
        .flatMap(({ positions }) => positions)
        .flatMap((position) => {
          if (isStrkDelegatedStakingPosition(position)) {
            return []
          }

          if (isCollateralizedDebtBorrowingPosition(position)) {
            return [
              ...position.collateralizedPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
              ...position.debtPositions.flatMap((p) =>
                p.liquidityToken ? [p.liquidityToken] : [],
              ),
            ]
          }

          return position.liquidityToken ? [position.liquidityToken] : []
        })

      return uniqWith(tokens, equalToken)
    }),
  (a, b) => a === b,
)
