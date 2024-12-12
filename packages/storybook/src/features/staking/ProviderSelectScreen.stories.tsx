import { NativeStakingProviderSelectScreen } from "@argent-x/extension/src/ui/features/defi/staking/NativeStakingProviderSelectScreen"

import { decorators } from "../../decorators/routerDecorators"
import { investments } from "./__fixtures__/starknet-staking-investments.json"

export default {
  component: NativeStakingProviderSelectScreen,
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
