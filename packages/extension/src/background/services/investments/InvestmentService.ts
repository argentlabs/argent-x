import type {
  IHttpService,
  Investment,
  InvestmentsResponse,
  StrkDelegatedStakingInvestment,
  ApiDefiPositions,
} from "@argent/x-shared"
import {
  urlWithQuery,
  safeParseAndWarn,
  apiDefiPositionsSchema,
  addressSchema,
} from "@argent/x-shared"
import type { IBackgroundInvestmentService } from "./IBackgroundInvestmentService"
import type { ArgentDatabase } from "../../../shared/idb/db"
import { isEqual } from "lodash-es"
import type {
  AccountInvestmentsKey,
  AccountInvestments,
} from "../../../shared/investments/types"
import { chunkedBulkPut } from "../../../shared/idb/utils/chunkedBulkPut"
import type { IStakingStore } from "../../../shared/staking/storage"
import type { KeyValueStorage } from "../../../shared/storage"

export class InvestmentService implements IBackgroundInvestmentService {
  constructor(
    private readonly argentTokensDefiInvestmentsUrl: string = "",
    private readonly httpService: IHttpService,
    private readonly db: ArgentDatabase,
    private readonly stakingStore: KeyValueStorage<IStakingStore>,
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

    const response = await this.httpService.get<ApiDefiPositions>(url)

    const validationResult = safeParseAndWarn(apiDefiPositionsSchema, response)

    if (!validationResult.success) {
      console.error(
        "Backend schema has changed. Make the changes to the models to prevent unknown/unhandled errors.",
      )
    }

    return response
  }

  async updateInvestmentsForAccounts(
    updates: AccountInvestments[],
  ): Promise<void> {
    const keys: AccountInvestmentsKey[] = updates.map(
      ({ address, networkId }) => [address, networkId],
    )
    const existingInvestments = await this.db.investments.bulkGet(keys)
    const updatedInvestments = updates.filter((update, index) => {
      const existing = existingInvestments[index]
      return (
        !existing ||
        !isEqual(existing.defiDecomposition, update.defiDecomposition)
      )
    })

    if (updatedInvestments.length > 0) {
      await chunkedBulkPut(this.db.investments, updatedInvestments)
    }
  }

  async updateStakingEnabled(enabled: boolean): Promise<void> {
    await this.stakingStore.set("enabled", enabled)
  }

  async updateStakingApyPercentage(apyPercentage: string): Promise<void> {
    await this.stakingStore.set("apyPercentage", apyPercentage)
  }
}
