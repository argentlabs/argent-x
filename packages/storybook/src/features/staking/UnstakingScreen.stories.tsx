import { UnstakingScreen } from "@argent-x/extension/src/ui/features/defi/staking/UnstakingScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: UnstakingScreen,
  decorators,
}

export const Default = {
  args: {
    tokenInfo: {
      address: "0x123",
      name: "Starknet Token",
      symbol: "STRK",
      decimals: 18,
    },
    balance: {
      stakedAmount: "3000000000000000000",
      rewards: "1000000000000000000",
      total: "4000000000000000000",
    },
    usdValue: {
      stakedAmount: "2.5",
      rewards: "1.5",
      total: "4",
    },
    stakerInfo: {
      address: "0x123",
      name: "Argent",
    },
    onBack: () => {},
  },
}
