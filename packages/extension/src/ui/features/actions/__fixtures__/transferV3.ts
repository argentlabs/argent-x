import { TransactionActionFixture } from "./types"

export const transferV3: TransactionActionFixture = {
  actionHash: "abc123",
  aggregatedData: [
    {
      token: {
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
        showAlways: true,
        networkId: "localhost",
        type: "erc20",
      },
      approvals: [],
      amount: BigInt("-4835920881083088"),
      usdValue: "0",
      recipients: [
        {
          address:
            "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          amount: BigInt("-4835920881083088"),
        },
      ],
      safe: true,
    },
  ],
  transactionReview: {
    assessment: "warn",
    reviews: [
      {
        assessment: "warn",
        assessmentDetails: {
          contract_address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        },
        activity: {
          value: {
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
              unknown: false,
              type: "ERC20",
            },
            amount: "4835920881083088",
            usd: 8,
            slippage: "equal",
          },
          recipient:
            "2377291062867794509008003741341082264125447210642161352160499804006396049914",
          type: "transfer",
        },
        assessmentReason: "contract_is_not_verified",
      },
    ],
    reason: "contract_is_not_verified",
    targetedDapp: {
      name: "JediSwap",
      description:
        "A community-led fully permissionless and composable AMM on Starknet.",
      logoUrl: "https://www.dappland.com/dapps/jediswap/dapp-icon-jediswap.png",
      links: [
        {
          name: "website",
          url: "https://jediswap.xyz",
          position: 1,
        },
        {
          name: "twitter",
          url: "https://twitter.com/jediswap",
          position: 2,
        },
        {
          name: "discord",
          url: "https://discord.gg/jediswap",
          position: 3,
        },
      ],
    },
  },
  transactions: [
    {
      calldata: [
        "2377291062867794509008003741341082264125447210642161352160499804006396049914",
        "4835920881083088",
        "0",
      ],
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "transfer",
    },
  ],
  transactionSimulation: [
    {
      approvals: [],
      transfers: [
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          to: "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          value: "4835920881083088",
          details: {
            decimals: "18",
            symbol: "ETH",
            name: "Ether",
            tokenType: "erc20",
            usdValue: "0.014761",
            tokenURI: "",
          },
        },
      ],
      feeEstimation: {
        overallFee: 374400003744,
        gasPrice: 100000001,
        gasUsage: 3744,
        unit: "FRI",
        maxAmount: 7018,
        maxPricePerUnit: 19999989162,
      },
    },
  ],
}
