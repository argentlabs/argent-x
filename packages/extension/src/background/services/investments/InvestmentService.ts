import type {
  Address,
  ApiDefiPositions,
  IHttpService,
  Investment,
  InvestmentsResponse,
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"
import {
  addressSchema,
  apiDefiPositionsSchema,
  HttpError,
  safeParseAndWarn,
  STRK_TOKEN_ADDRESS,
  urlWithQuery,
} from "@argent/x-shared"
import { isEqual, isNil, isObject, uniqWith } from "lodash-es"
import urlJoin from "url-join"
import type { AccountInvestments } from "../../../shared/investments/types"
import { browserExtensionSentryWithScope } from "../../../shared/sentry/scope"
import type { IStakingStore } from "../../../shared/staking/storage"
import type { InvestmentSubmittedRequest } from "../../../shared/staking/types"
import type { KeyValueStorage } from "../../../shared/storage"
import type { IBackgroundInvestmentService } from "./IBackgroundInvestmentService"
import type {
  IInvestmentsByPositionIdRepository,
  IInvestmentsRepository,
} from "../../../shared/investments/repository"
import { accountsEqualByAddress } from "../../../shared/utils/accountsEqual"
import { computeStrkDelegatedStakingPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeStrkDelegatedStakingPositionsUsdValue"
import { computeCollateralizedDebtLendingPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeCollateralizedDebtPositionsUsdValue"
import type {
  ParsedPosition,
  PositionBaseToken,
} from "../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../../shared/defiDecomposition/schema"
import { computeConcentratedLiquidityPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeConcentratedLiquidityPositionsUsdValue"
import type { ArgentDatabase } from "../../../shared/idb/db"
import { computeStakingPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeStakingPositionsUsdValue"
import { computeCollateralizedDebtBorrowingPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeCollateralizedDebtPositionsUsdValue"
import { computeDelegatedTokensPositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeDelegatedTokensPositionsUsdValue"
import type { Token } from "../../../shared/token/__new/types/token.model"
import type { TokenPriceDetails } from "../../../shared/token/__new/types/tokenPrice.model"
import { computeDefiDecompositionUsdValue } from "../../../shared/defiDecomposition/helpers/computeDefiDecompositionUsdValue"
import { equalToken } from "../../../shared/token/__new/utils"
import { getPositionTokenBalance } from "../../../shared/defiDecomposition/getPositionTokenBalance"

const ACTIONS_MAP = {
  stake: "buy",
  deposit: "buy",
  claim: "claim",
  withdraw: "sell",
  initiateWithdraw: "sell",
}

export class InvestmentService implements IBackgroundInvestmentService {
  constructor(
    private readonly argentTokensDefiInvestmentsUrl: string = "",
    private readonly httpService: IHttpService,
    private readonly db: ArgentDatabase,
    private readonly stakingStore: KeyValueStorage<IStakingStore>,
    private readonly investmentsRepo: IInvestmentsRepository,
    private readonly investmentsByPositionIdRepo: IInvestmentsByPositionIdRepository,
  ) {}

  get investmentUrl() {
    return this.argentTokensDefiInvestmentsUrl
  }

  private get defaultQueryParams() {
    return {
      chain: "starknet",
      currency: "USD",
      application: "argentx",
    }
  }

  async getAllInvestments(): Promise<Investment[]> {
    const url = urlWithQuery(
      [this.argentTokensDefiInvestmentsUrl, "/investments"],
      this.defaultQueryParams,
    )
    const response = await this.httpService.get<InvestmentsResponse>(url)
    return response?.investments ?? []
  }

  async getStrkDelegatedStakingInvestments(): Promise<
    StrkDelegatedStakingInvestment[]
  > {
    const investments = await this.getAllInvestments()
    return investments
      .filter((investment) => investment.category === "strkDelegatedStaking")
      .filter((investment) => investment.buyEnabled) // Need to do it in 2 steps to make TS happy
  }

  async getStrkLiquidStakingInvestments(): Promise<LiquidStakingInvestment[]> {
    const investments = await this.getAllInvestments()
    return investments
      .filter((investment) => investment.category === "staking")
      .filter((investment) =>
        investment.investableAssets.tokenAddresses.some(
          (address) => address === STRK_TOKEN_ADDRESS,
        ),
      )
  }

  async fetchInvestmentsForAccount(
    accountAddress: string,
  ): Promise<ApiDefiPositions> {
    const url = urlWithQuery(
      [
        this.argentTokensDefiInvestmentsUrl,
        addressSchema.parse(accountAddress),
        "investments",
      ],
      this.defaultQueryParams,
    )

    try {
      const response = await this.httpService.get<ApiDefiPositions>(url)

      const validationResult = safeParseAndWarn(
        apiDefiPositionsSchema,
        response,
      )

      if (!validationResult.success) {
        console.error(
          "Backend schema has changed. Make the changes to the models to prevent unknown/unhandled errors.",
        )
      }

      return response
    } catch (error) {
      if (
        error instanceof HttpError &&
        this.isInvestmentsInitialising(error.data)
      ) {
        console.warn(
          "Investments are still initialising. Please try again later.",
        )
      } else {
        console.error("Error fetching investments")
      }

      return { dapps: [] }
    }
  }

  private async getPositionWithUsdValue(
    position: ParsedPosition,
    tokens: Token[],
    tokenPrices: TokenPriceDetails[],
  ) {
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
    } else if (isCollateralizedDebtLendingPosition(position)) {
      return computeCollateralizedDebtLendingPositionUsdValue(
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
  }

  private async getPositionTitle(position: ParsedPosition, tokens: Token[]) {
    const unknownLabel = "Unknown"

    const findToken = (baseToken: PositionBaseToken) =>
      tokens.find((token) => equalToken(token, baseToken))

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
  }

  private async getPositionTitleDetails(
    position: ParsedPosition,
    title: string,
    tokens: Token[],
  ) {
    if (isCollateralizedDebtBorrowingPosition(position)) {
      return `Borrowing ${title}`
    } else if (isCollateralizedDebtLendingPosition(position)) {
      return `Lending ${title}`
    } else if (
      isStakingPosition(position) ||
      isStrkDelegatedStakingPosition(position)
    ) {
      const token = tokens.find((token) => equalToken(token, position.token))
      return `Staking ${token?.symbol ?? "Unknown"}`
    } else if (isDelegatedTokensPosition(position)) {
      return `Delegating ${title}`
    } else if (isConcentratedLiquidityPosition(position)) {
      return `Providing liquidity ${title}`
    }
    return title
  }

  private getPositionTokenBalanceWithAddress(
    address: Address,
    token: PositionBaseToken,
  ) {
    return getPositionTokenBalance(address, token)
  }

  private async getDefiDecompositionTokenBalances(
    investment: AccountInvestments,
  ) {
    const tokenBalances = investment.defiDecomposition
      .flatMap(({ products }) => products)
      .flatMap(({ positions }) => positions)
      .flatMap((position) => {
        if (isConcentratedLiquidityPosition(position)) {
          return [
            this.getPositionTokenBalanceWithAddress(
              investment.address,
              position.token0,
            ),
            this.getPositionTokenBalanceWithAddress(
              investment.address,
              position.token1,
            ),
          ]
        }
        if (isCollateralizedDebtBorrowingPosition(position)) {
          return [
            ...position.collateralizedPositions.map((p) =>
              this.getPositionTokenBalanceWithAddress(
                investment.address,
                p.token,
              ),
            ),
            ...position.debtPositions.map((p) => {
              const positionTokenBalance =
                this.getPositionTokenBalanceWithAddress(
                  investment.address,
                  p.token,
                )
              return {
                ...positionTokenBalance,
                balance: `-${positionTokenBalance.balance}`, // debt position, we need negative balance
              }
            }),
          ]
        }

        return [
          this.getPositionTokenBalanceWithAddress(
            investment.address,
            position.token,
          ),
        ]
      })

    return tokenBalances
  }

  private async getLiquidityTokens(investment: AccountInvestments) {
    const tokens = investment.defiDecomposition
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
  }

  private async getLiquidityTokensByPosition(position: ParsedPosition) {
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
  }

  async updateInvestmentsForAccounts(
    updates: AccountInvestments[],
  ): Promise<void> {
    const existingInvestments = await this.investmentsRepo.get()
    const updatedInvestments = updates.filter((update) => {
      const existing = existingInvestments.find((investment) =>
        accountsEqualByAddress(investment, update),
      )
      return (
        !existing ||
        !isEqual(existing.defiDecomposition, update.defiDecomposition)
      )
    })

    const tokens = await this.db.tokens.toArray()
    const tokenPrices = await this.db.tokenPrices.toArray()

    // Keep a denormalized version of the position in the store for faster access
    await Promise.all(
      updatedInvestments
        .flatMap((accountInvestment) =>
          accountInvestment.defiDecomposition.flatMap((defiDecomposition) =>
            defiDecomposition.products.flatMap((product) =>
              product.positions.map((position) => ({
                positionId: position.id,
                position,
              })),
            ),
          ),
        )
        .map(async ({ positionId, position }) => {
          const positionWithUsdValue = await this.getPositionWithUsdValue(
            position,
            tokens,
            tokenPrices,
          )

          if (!positionId || !positionWithUsdValue) {
            return
          }

          const positionTitle = await this.getPositionTitle(position, tokens)
          const positionTitleDetails = await this.getPositionTitleDetails(
            position,
            positionTitle,
            tokens,
          )
          const liquidityTokens =
            await this.getLiquidityTokensByPosition(position)

          await this.investmentsByPositionIdRepo.set(positionId, {
            ...positionWithUsdValue,
            title: positionTitle,
            titleDetails: positionTitleDetails,
            liquidityTokens,
          })
        }),
    )

    // Keep a denormalized version of the defi decomposition with usd values as well
    const updatedInvestmentsWithUsdValue = await Promise.all(
      updatedInvestments.map(async (accountInvestment) => ({
        ...accountInvestment,
        defiDecomposition: computeDefiDecompositionUsdValue(
          accountInvestment.defiDecomposition,
          tokens,
          tokenPrices,
        ),
        tokenBalances:
          await this.getDefiDecompositionTokenBalances(accountInvestment),
        liquidityTokens: await this.getLiquidityTokens(accountInvestment),
      })),
    )

    await this.investmentsRepo.upsert(updatedInvestmentsWithUsdValue)
  }

  async updateStakingEnabled(enabled: boolean): Promise<void> {
    await this.stakingStore.set("enabled", enabled)
  }

  async updateStakingApyPercentage(
    apyPercentage: string,
    type: "native" | "liquid",
  ): Promise<void> {
    await this.stakingStore.set(`${type}ApyPercentage`, apyPercentage)
  }

  private isInvestmentsInitialising(data?: unknown) {
    return (
      isObject(data) &&
      !isNil(data) &&
      "status" in data &&
      data.status === "initialising"
    )
  }

  async notifySubmittedInvestment(
    investmentId: string,
    data: InvestmentSubmittedRequest,
  ) {
    const investmentAction = ACTIONS_MAP[data.action]

    const url = urlJoin(
      this.argentTokensDefiInvestmentsUrl,
      "/investments",
      investmentId,
      "submittedTransaction",
    )

    try {
      const response = await this.httpService.post<string>(url, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          action: investmentAction,
        }),
      })

      if (response !== '"Processed submitted transaction"') {
        throw new Error(`Unexpected response: ${response}`)
      }
    } catch (error) {
      browserExtensionSentryWithScope((scope) => {
        scope.setLevel("warning")
        scope.setExtra("investmentSubmittedRequest", data)
        scope.captureException(
          error instanceof Error ? error : new Error("Unknown error occurred"),
        )
      })
    }
  }
}
