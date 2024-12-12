import type { messageClient } from "../trpc"
import type { IStakingService } from "../../../shared/staking/IStakingService"
import type { StrkStakingCalldataWithAccountType } from "../../../shared/staking/types"
import type { StrkStakingCalldata } from "@argent/x-shared"

export class StakingService implements IStakingService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getStakeCalldata(input: StrkStakingCalldata) {
    return this.trpcMessageClient.staking.stakeCalldata.query(input)
  }

  async stake(input: StrkStakingCalldataWithAccountType) {
    return this.trpcMessageClient.staking.stake.mutate(input)
  }

  async initiateUnstake(input: StrkStakingCalldataWithAccountType) {
    return this.trpcMessageClient.staking.initiateUnstake.mutate(input)
  }

  async claim(input: StrkStakingCalldataWithAccountType) {
    return this.trpcMessageClient.staking.claim.mutate(input)
  }

  async unstake(input: StrkStakingCalldataWithAccountType) {
    return this.trpcMessageClient.staking.unstake.mutate(input)
  }
}
