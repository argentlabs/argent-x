import { TransactionActionFixture } from "./types"

export const jediswap: TransactionActionFixture = {
  actionHash: "abc123",
  aggregatedData: [
    {
      token: {
        address:
          "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/usdc.png",
        networkId: "mainnet-alpha",
        type: "erc20",
      },
      approvals: [],
      amount: 14764n,
      usdValue: "0.014737",
      recipients: [
        {
          address:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          amount: 14764n,
          usdValue: "0.014737",
        },
      ],
      safe: true,
    },
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
      approvals: [
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
          },
          owner:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          spender:
            "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
          amount: 8812345773212n,
          usdValue: "0.014761",
        },
      ],
      amount: -8812345773212n,
      usdValue: "-0.014761",
      recipients: [
        {
          address:
            "0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a",
          amount: -8812345773212n,
          usdValue: "0.014761",
        },
      ],
      safe: true,
    },
  ],
  transactionReview: {
    assessment: "neutral",
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
    reviews: [
      {
        assessment: "neutral",
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
            amount: "8812345773212",
            usd: 0.01,
            slippage: "equal",
          },
          spender:
            "1865474183096745675831575676844391349131672372457503153362467315114684543011",
          type: "approve",
        },
      },
      {
        assessment: "neutral",
        assessmentDetails: {
          contract_address:
            "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
        },
        activity: {
          src: {
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
              unknown: false,
              type: "ERC20",
            },
            amount: "8812345773212",
            usd: 0.01,
            slippage: "equal",
          },
          dst: {
            token: {
              address:
                "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              unknown: false,
              type: "ERC20",
            },
            amount: "14709",
            usd: 0.01,
            slippage: "at_least",
          },
          type: "swap",
        },
      },
    ],
  },
  transactions: [
    {
      calldata: [
        "1865474183096745675831575676844391349131672372457503153362467315114684543011",
        "8812345773212",
        "0",
      ],
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "approve",
    },
    {
      calldata: [
        "8812345773212",
        "0",
        "14709",
        "0",
        "2",
        "2087021424722619777119509474943472645767659996348769578120564519014510906823",
        "2368576823837625528275935341135881659748932889268308403712618244410713532584",
        "2689035213040902571798644155430358178496847363710771602620498934381075712549",
        "1678883718",
      ],
      contractAddress:
        "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
      entrypoint: "swap_exact_tokens_for_tokens",
    },
  ],
  transactionSimulation: [
    {
      approvals: [
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          owner:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          spender:
            "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
          value: "8812345773212",
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
      transfers: [
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          to: "0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a",
          value: "8812345773212",
          details: {
            decimals: "18",
            symbol: "ETH",
            name: "Ether",
            tokenType: "erc20",
            usdValue: "0.014761",
            tokenURI: "",
          },
        },
        {
          tokenAddress:
            "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          from: "0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a",
          to: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          value: "14764",
          details: {
            decimals: "6",
            symbol: "USDC",
            name: "USD Coin",
            tokenType: "erc20",
            usdValue: "0.014737",
            tokenURI: "",
          },
        },
      ],
      feeEstimation: {
        overallFee: 3744000037440,
        gasPrice: 1000000010,
        gasUsage: 3744,
        unit: "wei",
      },
    },
  ],
}

export const jediswapUnsafe: TransactionActionFixture = {
  ...jediswap,
  aggregatedData: jediswap.aggregatedData.map((data) => ({
    ...data,
    safe: false,
  })),
}
