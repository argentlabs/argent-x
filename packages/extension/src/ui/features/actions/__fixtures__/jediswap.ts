import type { TransactionActionFixture } from "./types"

export const jediswap: TransactionActionFixture = {
  transactionReview: {
    transactions: [
      {
        reviewOfTransaction: {
          assessment: "neutral",
          warnings: [],
          targetedDapp: {
            name: "JediSwap",
            description:
              "A community-led fully permissionless and composable AMM on Starknet.",
            logoUrl:
              "https://www.dappland.com/dapps/jediswap/dapp-icon-jediswap.png",
            iconUrl:
              "https://www.dappland.com/dapps/jediswap/dapp-icon-jediswap.png",
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
            argentVerified: true,
          },

          reviews: [
            {
              assessment: "neutral",
              warnings: [],
              action: {
                name: "ERC20_approve",
                properties: [
                  {
                    type: "amount",
                    label: "ERC20_approve_amount",
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
                    amount: "1000000000000000",
                    usd: "3.45",
                    editable: true,
                  },
                  {
                    type: "address",
                    label: "ERC20_approve_to",
                    address:
                      "0x07e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
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
                    entrypoint: "approve",
                    calldata: [
                      "0x07e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
                      "0x00000000000000000000000000000000000000000000000000038d7ea4c68000",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                    ],
                  },
                ],
              },
            },
            {
              assessment: "neutral",
              warnings: [],
              action: {
                name: "multi_route_swap",
                properties: [],
                defaultProperties: [
                  {
                    type: "address",
                    label: "default_contract",
                    address:
                      "0x07e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
                    verified: false,
                  },
                  {
                    type: "calldata",
                    label: "default_call",
                    entrypoint: "multi_route_swap",
                    calldata: [
                      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                      "0x00000000000000000000000000000000000000000000000000038d7ea4c68000",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                      "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
                      "0x00000000000000000000000000000000000000000000000000000021b6205d65",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                      "0x00000000000000000000000000000000000000000000000000000021236a0dfb",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                      "0x0325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
                      "0x0000000000000000000000000000000000000000000000000000000000000064",
                      "0x03e90652c3fe1f5f42578ffefca7fb00c88d4d18b5fb2bbeeee1a0d0d7d7d82d",
                      "0x0000000000000000000000000000000000000000000000000000000000000002",
                      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                      "0x02bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965",
                      "0x0000000000000000000000000000000000000000000000000000000000000064",
                      "0x0000000000000000000000000000000000000000000000000000000000000000",
                      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                      "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
                      "0x0436924c4ed166d3c283d516adc424976cfccba108e3a0e3f3fc1ef319e23aa7",
                      "0x0000000000000000000000000000000000000000000000000000000000000064",
                      "0x0000000000000000000000000000000000000000000000000000000000000002",
                      "0x0138e908d3e2bfce75c2c108136428f90447c321b9fa1b2fddf25c741e8dbbf1",
                      "0x000000000000000000000000000000000000009ebbfa808e40fa6010b04239a8",
                    ],
                  },
                ],
              },
            },
          ],
        },
        simulation: {
          approvals: [
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              owner:
                "0x325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
              spender:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              value: "1000000000000000",
              approvalForAll: false,
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
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              owner:
                "0x325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
              spender:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              value: "0",
              approvalForAll: false,
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
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              owner:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              spender:
                "0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965",
              value: "1000000000000000",
              approvalForAll: false,
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
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              owner:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              spender:
                "0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965",
              value: "0",
              approvalForAll: false,
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
            {
              tokenAddress:
                "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              owner:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              spender:
                "0x436924c4ed166d3c283d516adc424976cfccba108e3a0e3f3fc1ef319e23aa7",
              value: "557226183292359",
              approvalForAll: false,
              details: {
                address:
                  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                name: "Starknet Token",
                symbol: "STRK",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/strk.png",
                type: "ERC20",
              },
            },
            {
              tokenAddress:
                "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              owner:
                "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              spender:
                "0x436924c4ed166d3c283d516adc424976cfccba108e3a0e3f3fc1ef319e23aa7",
              value: "0",
              approvalForAll: false,
              details: {
                address:
                  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                name: "Starknet Token",
                symbol: "STRK",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/strk.png",
                type: "ERC20",
              },
            },
          ],
          transfers: [
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              from: "0x325c46cdbf81d35020f95a82a4dc4d043599f58cfb979b03e2efffdeab20477",
              to: "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              value: "1000000000000000",
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
            {
              tokenAddress:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              from: "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              to: "0x4e021092841c1b01907f42e7058f97e5a22056e605dce08a22868606ad675e0",
              value: "1000000000000000",
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
            {
              tokenAddress:
                "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              from: "0x4e021092841c1b01907f42e7058f97e5a22056e605dce08a22868606ad675e0",
              to: "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              value: "557226183292359",
              details: {
                address:
                  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                name: "Starknet Token",
                symbol: "STRK",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/strk.png",
                type: "ERC20",
              },
            },
            {
              tokenAddress:
                "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              from: "0x7e36202ace0ab52bf438bd8a8b64b3731c48d09f0d8879f5b006384c2f35032",
              to: "0x436924c4ed166d3c283d516adc424976cfccba108e3a0e3f3fc1ef319e23aa7",
              value: "557226183292359",
              details: {
                address:
                  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                name: "Starknet Token",
                symbol: "STRK",
                decimals: 18,
                unknown: false,
                iconUrl:
                  "https://dv3jj1unlp2jl.cloudfront.net/128/color/strk.png",
                type: "ERC20",
              },
            },
          ],
          summary: [
            {
              type: "transfer",
              label: "simulation_summary_send",
              value: "1000000000000000",
              usdValue: "3.44",
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
            overallFee: 30351000212457,
            gasPrice: 1000000007,
            gasUsage: 30351,
            unit: "WEI",
            maxFee: 91053000052888,
          },
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
}

export const jediswapUnsafe: TransactionActionFixture = {
  ...jediswap,
}
