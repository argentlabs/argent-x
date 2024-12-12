import type { TransactionActionFixture } from "./types"

export const transfer: TransactionActionFixture = {
  transactionReview: {
    transactions: [
      {
        reviewOfTransaction: {
          assessment: "neutral",
          warnings: [],
          reviews: [
            {
              assessment: "neutral",
              warnings: [],
              action: {
                name: "ERC20_transfer",
                properties: [
                  {
                    type: "amount",
                    label: "ERC20_transfer_amount",
                    token: {
                      address:
                        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                      name: "Ether",
                      symbol: "ETH",
                      decimals: 18,
                      unknown: false,
                      iconUrl:
                        "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
                      type: "ERC20",
                    },
                    amount: "100000000000000",
                    usd: "0.34",
                    editable: false,
                  },
                  {
                    type: "address",
                    label: "ERC20_transfer_recipient",
                    address:
                      "0x00146ab475f565af0277640952c2cf4c9bb05b6932a7bb454b92746bb9715911",
                    verified: false,
                  },
                ],
                defaultProperties: [
                  {
                    type: "token_address",
                    label: "default_contract",
                    token: {
                      address:
                        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                      name: "Ether",
                      symbol: "ETH",
                      decimals: 18,
                      unknown: false,
                      iconUrl:
                        "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
                      type: "ERC20",
                    },
                  },
                  {
                    type: "calldata",
                    label: "default_call",
                    entrypoint: "transfer",
                    calldata: [
                      "0x00146ab475f565af0277640952c2cf4c9bb05b6932a7bb454b92746bb9715911",
                      "0x00000000000000000000000000000000000000000000000000005af3107a4000",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                    ],
                  },
                ],
              },
            },
          ],
        },
        simulation: {
          approvals: [],
          transfers: [
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              from: "0x325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
              to: "0x146ab475f565af0277640952c2cf4c9bb05b6932a7bb454b92746bb9715911",
              value: "100000000000000",
              details: {
                address:
                  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
                type: "ERC20",
              },
            },
          ],
          summary: [
            {
              type: "transfer",
              label: "simulation_summary_send",
              value: "100000000000000",
              usdValue: "0.34",
              token: {
                address:
                  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
                type: "ERC20",
              },
              sent: true,
            },
          ],
          calculatedNonce: "0x1",
          feeEstimation: {
            overallFee: 2788000019516,
            gasPrice: 1000000007,
            gasUsage: 2788,
            unit: "WEI",
            maxFee: 8363998255470,
          },
        },
      },
    ],
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
}

export const transferWithWarnings: TransactionActionFixture = {
  ...transfer,
  transactionReview: {
    ...transfer.transactionReview,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    transactions: transfer.transactionReview?.transactions.map(
      (transaction) => {
        return {
          ...transaction,
          reviewOfTransaction: {
            ...transaction.reviewOfTransaction,
            assessment: "warn",
            warnings: [
              {
                reason: "undeployed_account",
                severity: "caution",
              },
            ],
          },
        }
      },
    ),
  },
}
