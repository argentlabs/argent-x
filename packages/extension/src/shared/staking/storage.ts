import { KeyValueStorage } from "../storage"

export interface IStakingStore {
  enabled: boolean
  nativeApyPercentage: string
  liquidApyPercentage: string
}

export const stakingStore = new KeyValueStorage<IStakingStore>(
  {
    enabled: false,
    nativeApyPercentage: "0",
    liquidApyPercentage: "0",
  },
  "core:staking",
)
