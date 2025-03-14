import type {
  StrkStakingCalldata,
  StrkStakingCalldataResponse,
} from "@argent/x-shared"
import type { StrkStakingCalldataWithAccountType } from "./types"

export interface IStakingService {
  getStakeCalldata: (
    input: StrkStakingCalldata,
  ) => Promise<StrkStakingCalldataResponse>
  stake: (input: StrkStakingCalldataWithAccountType) => Promise<string>
  claim: (input: StrkStakingCalldataWithAccountType) => Promise<string>
  initiateUnstake: (
    input: StrkStakingCalldataWithAccountType,
  ) => Promise<string>
  unstake: (input: StrkStakingCalldataWithAccountType) => Promise<string>
}
