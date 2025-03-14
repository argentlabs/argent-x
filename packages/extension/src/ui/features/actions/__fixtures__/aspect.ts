import type { TransactionActionFixture } from "./types"

export const aspect: TransactionActionFixture = {
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
                name: "mint",
                properties: [],
                defaultProperties: [
                  {
                    type: "address",
                    label: "default_contract",
                    address:
                      "0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
                    verified: false,
                  },
                  {
                    type: "calldata",
                    label: "default_call",
                    entrypoint: "mint",
                    calldata: [
                      "0x0325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
                      "0x00000000000000000000000000000000000000000000000000000000000f4c6e",
                      "0x0000000000000000000000000000000000000000000000000000000000000004",
                      "0x00000000000000000000000000000000000000000000000000000000000f4240",
                      "0x00000000000000000000000000000000000000000000000000000000688c50d8",
                      "0x03dc421f118edcd7c0a3b9913b4b40d40d8309dde29953210ec85ba365eb2d99",
                      "0x0132188b9576cf7eea5e25dc9aabee55cf131d4867b70880a20eceaed5358b76",
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
                "0x31f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
              from: "0x0",
              to: "0x325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
              tokenId: "1002606",
              details: {
                address:
                  "0x31f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
                name: "Xplorer",
                symbol: "XPLORER",
                unknown: false,
                type: "ERC721",
              },
            },
          ],
          summary: [
            {
              type: "transfer",
              label: "simulation_summary_receive",
              tokenId: "1002606",
              token: {
                address:
                  "0x31f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
                name: "Xplorer",
                symbol: "XPLORER",
                unknown: false,
                type: "ERC721",
              },
              sent: false,
            },
          ],
          calculatedNonce: "0x1",
          feeEstimation: {
            overallFee: 5786000040502,
            gasPrice: 1000000007,
            gasUsage: 5786,
            unit: "WEI",
            maxFee: 17358006159710,
          },
          feeEstimations: [
            {
              overallFee: 5786000040502,
              gasPrice: 1000000007,
              gasUsage: 5786,
              unit: "WEI",
              maxFee: 17358006159710,
            },
          ],
        },
      },
    ],
  },
  transactions: [
    {
      calldata: [
        "0x0325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
        "0x00000000000000000000000000000000000000000000000000000000000f4c6e",
        "0x0000000000000000000000000000000000000000000000000000000000000004",
        "0x00000000000000000000000000000000000000000000000000000000000f4240",
        "0x00000000000000000000000000000000000000000000000000000000688c50d8",
        "0x03dc421f118edcd7c0a3b9913b4b40d40d8309dde29953210ec85ba365eb2d99",
        "0x0132188b9576cf7eea5e25dc9aabee55cf131d4867b70880a20eceaed5358b76",
      ],
      contractAddress:
        "0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
      entrypoint: "mint",
    },
  ],
}
