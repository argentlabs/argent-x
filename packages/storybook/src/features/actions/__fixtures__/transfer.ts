import BigNumber from "bignumber.js"

export default {
  actionHash: "abc123",
  aggregatedData: [
    {
      token: {
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        network: "localhost",
        image: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
        showAlways: true,
        networkId: "localhost",
        type: "erc20",
      },
      approvals: [],
      amount: "-4835920881083088",
      usdValue: new BigNumber("0"),
      recipients: [
        {
          address:
            "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          amount: "-4835920881083088",
        },
      ],
      safe: true,
    },
  ],
  transactionReview: {
    assessment: "warn",
    reasons: ["contract_is_not_verified"],
    reviews: [
      {
        assessment: "warn",
        assessmentReasons: ["contract_is_not_verified"],
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
  },
  transactions: {
    calldata: [
      "2377291062867794509008003741341082264125447210642161352160499804006396049914",
      "4835920881083088",
      "0",
    ],
    contractAddress:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    entrypoint: "transfer",
  },
  transactionSimulation: {
    approvals: [],
    transfers: [
      {
        tokenAddress:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        from: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
        to: "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
        value: "4835920881083088",
        details: {
          tokenType: "erc20",
        },
      },
    ],
    feeEstimation: {
      overallFee: 160278299273344,
      gasPrice: 30569959808,
      gasUsage: 5243,
      unit: "wei",
    },
  },
}
