import { StakingProviderSelectScreen } from "@argent-x/extension/src/ui/features/defi/staking/StakingProviderSelectScreen"
import { decorators } from "../../decorators/routerDecorators"
import { investments } from "./__fixtures__/starknet-staking-investments.json"

export default {
  component: StakingProviderSelectScreen,
  decorators,
}

export const Default = {
  args: {
    investments,
  },
}

export const Empty = {
  args: {
    investments: [],
  },
}
