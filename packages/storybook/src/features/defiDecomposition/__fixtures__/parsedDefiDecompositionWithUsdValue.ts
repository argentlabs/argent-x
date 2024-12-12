import { ParsedDefiDecompositionWithUsdValue } from "@argent-x/extension/src/shared/defiDecomposition/schema"

export const parsedPositionsWithUsdValue: ParsedDefiDecompositionWithUsdValue =
  [
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
                networkId: "sepolia-alpha",
                usdValue: "1.050005476669488196418579885",
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
                networkId: "sepolia-alpha",
                usdValue: "0.058365966678547907384014494",
              },
            },
          ],
          totalUsdValue: "1.108371443348036103802594379",
        },
      ],
      totalUsdValue: "1.108371443348036103802594379",
    },
    {
      dappId: "02d43d9d-b82e-44fb-aaa1-69753adc2f14",
      products: [
        {
          type: "collateralizedDebtLendingPosition",
          manageUrl: "https://vesu-git-sepolia-vesu.vercel.app/positions/earn",
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
                networkId: "sepolia-alpha",
                usdValue: "7998.868427433808806882",
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
                networkId: "sepolia-alpha",
                usdValue: "1252645.40737625120985132",
              },
            },
          ],
          totalUsdValue: "1260644.275803685018658202",
        },
        {
          type: "collateralizedDebtBorrowingPosition",
          manageUrl: "https://vesu-git-sepolia-vesu.vercel.app/positions/earn",
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
                    networkId: "sepolia-alpha",
                    usdValue: "20870000.0012132577431737975",
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
                    networkId: "sepolia-alpha",
                    usdValue: "14631.04353477817251354",
                  },
                },
              ],
              totalUsdValue: "20855368.9576784795706602575",
              collateralizedPositionsTotalUsdValue:
                "20870000.0012132577431737975",
              debtPositionsTotalUsdValue: "14631.04353477817251354",
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
                    networkId: "sepolia-alpha",
                    usdValue: "15653333.49653198246985099625",
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
                    networkId: "sepolia-alpha",
                    usdValue: "1000177362595112.866171755970450826",
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
                    networkId: "sepolia-alpha",
                    usdValue: "2638042.4408761844502403106429956",
                  },
                },
              ],
              totalUsdValue: "1000177375610403.9218275539900615116070044",
              collateralizedPositionsTotalUsdValue:
                "20870000.0012132577431737975",
              debtPositionsTotalUsdValue: "2638042.4408761844502403106429956",
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
                    networkId: "sepolia-alpha",
                    usdValue: "23851.851851999999999998012345679",
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
                    networkId: "sepolia-alpha",
                    usdValue: "3333.992797477446390835",
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
                    networkId: "sepolia-alpha",
                    usdValue: "3276.855766971899953224534371844",
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
                    networkId: "sepolia-alpha",
                    usdValue: "0.473069574234336068534371844",
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
                    networkId: "sepolia-alpha",
                    usdValue: "1117845087471.468471572752257144",
                  },
                },
              ],
              totalUsdValue: "-1117845070230.938253596332937274056398009",
              collateralizedPositionsTotalUsdValue:
                "23851.851851999999999998012345679",
              debtPositionsTotalUsdValue:
                "1117845070230.938253596332937274056398009",
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
                    networkId: "sepolia-alpha",
                    usdValue: "23851.851851999999999998012345679",
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
                    networkId: "sepolia-alpha",
                    usdValue: "1000177362595112.866171755970450826",
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
                    networkId: "sepolia-alpha",
                    usdValue: "3333.992797477446390835",
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
                    networkId: "sepolia-alpha",
                    usdValue: "3276.855766971899953224534371844",
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
                    networkId: "sepolia-alpha",
                    usdValue: "0.473069574234336068534371844",
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
                    networkId: "sepolia-alpha",
                    usdValue: "1117845087471.468471572752257144",
                  },
                },
              ],
              totalUsdValue: "999059517524881.927918159637513551943601991",
              collateralizedPositionsTotalUsdValue:
                "23851.851851999999999998012345679",
              debtPositionsTotalUsdValue:
                "999059517524881.927918159637513551943601991",
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
          totalUsdValue: "1998119068920423.869170596865298046994208382",
        },
      ],
      totalUsdValue: "1998119070181068.144974281883956248994208382",
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
                networkId: "sepolia-alpha",
                usdValue: "46.1688389077225386274691",
              },
            },
          ],
          totalUsdValue: "46.1688389077225386274691",
        },
      ],
      totalUsdValue: "46.1688389077225386274691",
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
                networkId: "sepolia-alpha",
                principal: "1102394379714798486",
                accruedFees: "26047894253067246",
                minPrice: "0.000424331267348977",
                maxPrice: "0.000438129454574905",
                currentPrice: "0.000383264801039327",
                balance: "1128442273967865732",
                usdValue: "3307.450373613730023165357627972",
              },
              token1: {
                address:
                  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                networkId: "sepolia-alpha",
                principal: "0",
                accruedFees: "11107133261362",
                minPrice: "2282.430431367024993961",
                maxPrice: "2356.649337314997410431",
                currentPrice: "2609.16211790967372508",
                balance: "11107133261362",
                usdValue: "0.02909722721793787238503",
              },
              totalUsdValue: "3307.479470840947961037742657972",
            },
            {
              id: "a7b7ebede0d38d62542727df7c1c2cfb",
              poolFeePercentage: "0.05",
              tickSpacingPercentage: "0.1",
              token0: {
                address:
                  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                networkId: "sepolia-alpha",
                principal: "0",
                accruedFees: "158995656321138",
                minPrice: "2487.493917",
                maxPrice: "2568.380972",
                currentPrice: "2604.665835",
                balance: "158995656321138",
                usdValue: "0.000316028403306940909337298",
              },
              token1: {
                address:
                  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                networkId: "sepolia-alpha",
                principal: "5066944",
                accruedFees: "402659",
                minPrice: "0.000389350338108608",
                maxPrice: "0.000402011033360373",
                currentPrice: "0.000383926408709454",
                balance: "5469603",
                usdValue: "0.000000014328655066788945",
              },
              totalUsdValue: "0.000316042731962007698282298",
            },
          ],
          totalUsdValue: "3307.47978688367992304544094027",
        },
      ],
      totalUsdValue: "3307.47978688367992304544094027",
    },
  ]
