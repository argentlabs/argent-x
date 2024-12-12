import type {
  Investment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"

export interface IInvestmentService {
  getAllInvestments(): Promise<Investment[]>
  getStrkDelegatedStakingInvestments(): Promise<
    StrkDelegatedStakingInvestment[]
  >
}
