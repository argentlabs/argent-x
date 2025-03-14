import type { IInvestmentService } from "../../../shared/investments/IInvestmentService"
import type { messageClient } from "../trpc"

export class InvestmentService implements IInvestmentService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getAllInvestments() {
    return this.trpcMessageClient.investments.getAllInvestments.query()
  }

  async getStrkDelegatedStakingInvestments() {
    return this.trpcMessageClient.investments.getStrkDelegatedStakingInvestments.query()
  }

  async getStrkLiquidStakingInvestments() {
    return this.trpcMessageClient.investments.getStrkLiquidStakingInvestments.query()
  }
}
