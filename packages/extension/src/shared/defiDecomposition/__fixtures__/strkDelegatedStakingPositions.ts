import type { ApiDefiDecompositionProduct } from "@argent/x-shared"

export const strkDelegatedStakingPositions: ApiDefiDecompositionProduct = {
  productId: "5d4c7689-6759-4051-a6a2-baf4a397b081",
  name: "Starknet Delegated Staking",
  manageUrl: "todo",
  positions: [
    {
      id: "7a4ba7fd747c1abd11d8b77345da8005",
      investmentId: "6d2f225a-2bda-4973-a564-d127434da0c2",
      totalBalances: {
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d":
          "9999999900000000",
      },
      data: {
        stakerInfo: {
          name: "Voyager",
          iconUrl:
            "https://www.dappland.com/dapps/voyager/dapp-icon-voyager.png",
          address:
            "0x7aa2d3f4d79ed1c2183969b353f4f678559ca72a65dae207395a247c968af93",
        },
        stakedAmount: "9999999900000000",
        accruedRewards: "0",
        apy: "0.015014",
      },
    },
  ],
  type: "strkDelegatedStaking",
}
