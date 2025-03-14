import type {
  Investment,
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"

export interface IInvestmentService {
  getAllInvestments(): Promise<Investment[]>
  getStrkDelegatedStakingInvestments(): Promise<
    StrkDelegatedStakingInvestment[]
  >
  getStrkLiquidStakingInvestments(): Promise<LiquidStakingInvestment[]>
}
