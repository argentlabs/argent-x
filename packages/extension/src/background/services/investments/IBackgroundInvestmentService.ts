import type { ApiDefiPositions } from "@argent/x-shared"
import type { IInvestmentService } from "../../../shared/investments/IInvestmentService"
import type { AccountInvestments } from "../../../shared/investments/types"

export interface IBackgroundInvestmentService extends IInvestmentService {
  get investmentUrl(): string
  fetchInvestmentsForAccount(accountAddress: string): Promise<ApiDefiPositions>

  updateInvestmentsForAccounts(
    accountInvestements: AccountInvestments[],
  ): Promise<void>
  updateStakingEnabled(enabled: boolean): Promise<void>
  updateStakingApyPercentage(apyPercentage: string): Promise<void>
}
