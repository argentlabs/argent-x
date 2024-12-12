import { KeyValueStorage } from "../storage"

export interface IStakingStore {
  enabled: boolean
  apyPercentage: string
}

export const stakingStore = new KeyValueStorage<IStakingStore>(
  {
    enabled: false,
    apyPercentage: "0",
  },
  "core:staking",
)
