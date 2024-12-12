import { ParsedDefiDecomposition } from "@argent-x/extension/src/shared/defiDecomposition/schema"

export const parsedDefiDecomposition: ParsedDefiDecomposition = [
  {
    dappId: "b513a7c1-eb8a-4201-876c-becd8d445e15",
    products: [
      {
        type: "delegatedTokens",
        manageUrl: "https://app.ekubo.org/governance",
        name: "Delegated Governance",
        positions: [
          {
            id: "99e96b150b3339b9a0c55f30a2b4f4e0",
            delegatingTo:
              "0x04d8d7295721a1b972f5b9723f47ac73b1567c8d1e889cdc208840fb07816a54",
            token: {
              address:
                "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
              balance: "528263624904970685",
              networkId: "mainnet-alpha",
            },
          },
          {
            id: "b245685bf91c50dd6ff11279f77d8faa",
            delegatingTo:
              "0x064d28d1d1d53a0b5de12e3678699bc9ba32c1cb19ce1c048578581ebb7f8396",
            token: {
              address:
                "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
              balance: "29364244105174014",
              networkId: "mainnet-alpha",
            },
          },
        ],
      },
    ],
  },
  {
    dappId: "02d43d9d-b82e-44fb-aaa1-69753adc2f14",
    products: [
      {
        type: "collateralizedDebtLendingPosition",
        manageUrl: "https://vesu-git-mainnet-vesu.vercel.app/positions/earn",
        name: "Lending",
        positions: [
          {
            id: "39fedd17fc26b1fd2e52398e57b95e08",
            lending: true,
            apy: "0.000262",
            group: "undefined",
            collateral: false,
            debt: false,
            token: {
              address:
                "0x027ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
              balance: "8000005167",
              networkId: "mainnet-alpha",
            },
          },
          {
            id: "73899a8006b1350ca8f5d093101cb6a3",
            lending: true,
            apy: "0.000001",
            group: "undefined",
            collateral: false,
            debt: false,
            token: {
              address:
                "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca",
              balance: "802342859388",
              networkId: "mainnet-alpha",
            },
          },
        ],
      },
      {
        type: "collateralizedDebtBorrowingPosition",
        manageUrl: "https://vesu-git-mainnet-vesu.vercel.app/positions/earn",
        name: "Borrowing",
        positions: [
          {
            id: "1",
            group: "1",
            healthRatio: "2.713544",
            collateralizedPositions: [
              {
                id: "342570c9e9bf2a788f75db3743f51e9c",
                lending: true,
                apy: "0.000000",
                group: "1",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3",
                  balance: "8000000000465072445874",
                  networkId: "mainnet-alpha",
                },
              },
            ],
            debtPositions: [
              {
                id: "d2f2e19ba29ce34b7461f0a5257c8fb1",
                lending: false,
                apy: "0.001001",
                group: "1",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca",
                  balance: "9371457586",
                  networkId: "mainnet-alpha",
                },
              },
            ],
          },
          {
            id: "2",
            group: "2",
            healthRatio: "4.873483",
            collateralizedPositions: [
              {
                id: "040e37d3d98432c500c743b20c250eb6",
                lending: true,
                apy: "0.000000",
                group: "2",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3",
                  balance: "6000319500347669370331",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "050e37d3d98432c500c743b20c250eb6",
                lending: true,
                apy: "0.000000",
                group: "2",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x27ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
                  balance: "1000319500347669370331",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "060e37d3d98432c500c743b20c250eb6",
                lending: true,
                apy: "0.000000",
                group: "2",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
                  balance: "1000319500347669370331",
                  networkId: "mainnet-alpha",
                },
              },
            ],
            debtPositions: [
              {
                id: "8473bed540880f07b7f52c330103c870",
                lending: false,
                apy: "0.001018",
                group: "2",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x057181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
                  balance: "900052389162082643600",
                  networkId: "mainnet-alpha",
                },
              },
            ],
          },
          {
            id: "3",
            group: "3",
            healthRatio: "1.020603",
            collateralizedPositions: [
              {
                id: "328e835168d876676f4360c32f9f9753",
                lending: true,
                apy: "0.000000",
                group: "3",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x0772131070c7d56f78f3e46b27b70271d8ca81c7c52e3f62aa868fab4b679e43",
                  balance: "11999999999999999999999",
                  networkId: "mainnet-alpha",
                },
              },
            ],
            debtPositions: [
              {
                id: "7134500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3",
                  balance: "1278003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "1134500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
                  balance: "1118003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "4434500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x1fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
                  balance: "238003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "2334500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x27ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
                  balance: "1118003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
            ],
          },
          {
            id: "4",
            group: "4",
            healthRatio: "1.020603",
            collateralizedPositions: [
              {
                id: "328e835168d876676f4360c32f9f9753",
                lending: true,
                apy: "0.000000",
                group: "3",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x0772131070c7d56f78f3e46b27b70271d8ca81c7c52e3f62aa868fab4b679e43",
                  balance: "11999999999999999999999",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "050e37d3d98432c500c743b20c250eb6",
                lending: true,
                apy: "0.000000",
                group: "2",
                collateral: true,
                debt: false,
                token: {
                  address:
                    "0x27ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
                  balance: "1000319500347669370331",
                  networkId: "mainnet-alpha",
                },
              },
            ],
            debtPositions: [
              {
                id: "7134500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3",
                  balance: "1278003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "1134500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
                  balance: "1118003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "4434500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x1fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
                  balance: "238003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
              {
                id: "2334500b8452fe18a841717346b7afdb",
                lending: false,
                apy: "0.001000",
                group: "3",
                collateral: false,
                debt: true,
                token: {
                  address:
                    "0x27ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
                  balance: "1118003947284119364",
                  networkId: "mainnet-alpha",
                },
              },
            ],
          },
        ],
        groups: {
          "1": {
            healthRatio: "2.713544",
          },
          "2": {
            healthRatio: "4.873483",
          },
          "3": {
            healthRatio: "1.020603",
          },
          "4": {
            healthRatio: "0.020603",
          },
        },
      },
    ],
  },
  {
    dappId: "49007844-7a78-4185-be2f-b06bf6fc26a5",
    products: [
      {
        type: "staking",
        manageUrl:
          "https://app.avnu.fi/?tokenFrom=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&tokenTo=0x0703911a6196ef674fc635de02763dcd4ccc16d7cf736f68a9483cc44eccaa94",
        name: "Liquid Staking",
        positions: [
          {
            id: "937a82be8c5c92d615fd851c82dc6f9f",
            apy: "0.030927",
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              balance: "17623790831667140",
              networkId: "mainnet-alpha",
            },
          },
        ],
      },
    ],
  },
  {
    dappId: "2546e5d1-d806-4672-bf48-84d62cb95e21",
    products: [
      {
        type: "concentratedLiquidityPosition",
        manageUrl: "https://app.uniswap.org/#/swap",
        name: "Concentrated liquidity",
        positions: [
          {
            id: "050195914b6bb85dce82f3222c12154c",
            poolFeePercentage: "0.05",
            tickSpacingPercentage: "0.1",
            token0: {
              address:
                "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
              networkId: "mainnet-alpha",
              principal: "1102394379714798486",
              accruedFees: "26047894253067246",
              minPrice: "0.000424331267348977",
              maxPrice: "0.000438129454574905",
              currentPrice: "0.000383264801039327",
              balance: "1128442273967865732",
            },
            token1: {
              address:
                "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              networkId: "mainnet-alpha",
              principal: "0",
              accruedFees: "11107133261362",
              minPrice: "2282.430431367024993961",
              maxPrice: "2356.649337314997410431",
              currentPrice: "2609.16211790967372508",
              balance: "11107133261362",
            },
          },
          {
            id: "a7b7ebede0d38d62542727df7c1c2cfb",
            poolFeePercentage: "0.05",
            tickSpacingPercentage: "0.1",
            token0: {
              address:
                "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              networkId: "mainnet-alpha",
              principal: "0",
              accruedFees: "158995656321138",
              minPrice: "2487.493917",
              maxPrice: "2568.380972",
              currentPrice: "2604.665835",
              balance: "158995656321138",
            },
            token1: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              networkId: "mainnet-alpha",
              principal: "5066944",
              accruedFees: "402659",
              minPrice: "0.000389350338108608",
              maxPrice: "0.000402011033360373",
              currentPrice: "0.000383926408709454",
              balance: "5469603",
            },
          },
        ],
      },
    ],
  },
  {
    dappId: "ed0f9636-9a73-49e0-9f80-0932eafd0cee",
    products: [
      {
        productId: "5d4c7689-6759-4051-a6a2-baf4a397b081",
        type: "strkDelegatedStaking",
        manageUrl: "todo",
        name: "Starknet Delegated Staking",
        positions: [
          {
            id: "c0c050e8fb19fe3434cb9b3a9f0a7571",
            investmentId: "ee3dae35-85ac-4e67-b3ee-4e436c102cba",
            stakerInfo: {
              name: "Argent",
              iconUrl:
                "https://static.argent.net/dapp/logos/3131edcd-b7f4-47d4-89ae-bd461786e547.png",
              address:
                "0x041dc48224a5f025d07a3d73d7ce73bb03c730c36b02646e6291d3e95ba4a7a4",
            },
            accruedRewards: "21441934909680778219",
            stakedAmount: "20000000000000000000",
            apy: "0.016972",
            token: {
              address:
                "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
              balance: "41441934909680778219",
              networkId: "sepolia-alpha",
            },
            pendingWithdrawal: {
              amount: "41441934909680778219",
              withdrawableAfter: 1729624229,
            },
          },
        ],
      },
    ],
  },
]
