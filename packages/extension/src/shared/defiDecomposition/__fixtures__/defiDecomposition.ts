import type { ApiDefiPositions } from "@argent/x-shared"

export const defiDecomposition: ApiDefiPositions = {
  dapps: [
    {
      dappId: "b513a7c1-eb8a-4201-876c-becd8d445e15",
      products: [
        {
          productId: "01a7b83d-d4c4-4109-af0d-ad5b15ab712b",
          name: "Governance",
          manageUrl: "https://app.ekubo.org/governance",
          positions: [
            {
              id: "99e96b150b3339b9a0c55f30a2b4f4e0",
              totalBalances: {
                "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569":
                  "528263624904970685",
              },
              data: {
                delegatingTo:
                  "0x04d8d7295721a1b972f5b9723f47ac73b1567c8d1e889cdc208840fb07816a54",
              },
            },
            {
              id: "b245685bf91c50dd6ff11279f77d8faa",
              totalBalances: {
                "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569":
                  "29364244105174014",
              },
              data: {
                delegatingTo:
                  "0x064d28d1d1d53a0b5de12e3678699bc9ba32c1cb19ce1c048578581ebb7f8396",
              },
            },
          ],
          type: "delegatedTokens",
        },
      ],
    },
    {
      dappId: "02d43d9d-b82e-44fb-aaa1-69753adc2f14",
      products: [
        {
          productId: "e287cf81-8b05-425c-875b-ef031498ad31",
          name: "Lending & Borrowing",
          manageUrl: "https://vesu-git-sepolia-vesu.vercel.app/positions/earn",
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
          },
          positions: [
            {
              id: "39fedd17fc26b1fd2e52398e57b95e08",
              investmentId: "f071cc6a-27d7-49c8-a87c-1b41ea4113a6",
              tokenAddress:
                "0x07632c8fab1399aede8ad1f89411f082b0a492ca58e87b5ebc475d38f799b0c7",
              totalBalances: {
                "0x027ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94":
                  "8000005167",
              },
              data: {
                apy: "0.000262",
                totalApy: "0.0567",
                lending: true,
                debt: false,
                collateral: false,
              },
            },
            {
              id: "73899a8006b1350ca8f5d093101cb6a3",
              investmentId: "43e1aa72-06f2-4db6-9fb2-675b3cb3fc82",
              tokenAddress:
                "0x05868ed6b7c57ac071bf6bfe762174a2522858b700ba9fb062709e63b65bf186",
              totalBalances: {
                "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca":
                  "802342859388",
              },
              data: {
                apy: "0.000001",
                totalApy: "0.0001",
                lending: true,
                debt: false,
                collateral: false,
              },
            },
            {
              id: "342570c9e9bf2a788f75db3743f51e9c",
              totalBalances: {
                "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
                  "8000000000465072445874",
              },
              data: {
                apy: "0.000000",
                totalApy: "0.0000",
                group: 1,
                lending: true,
                debt: false,
                collateral: true,
              },
            },
            {
              id: "d2f2e19ba29ce34b7461f0a5257c8fb1",
              totalBalances: {
                "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca":
                  "-9371457586",
              },
              data: {
                apy: "0.001001",
                totalApy: "0.001001",
                group: 1,
                lending: false,
                debt: true,
                collateral: false,
              },
            },
            {
              id: "040e37d3d98432c500c743b20c250eb6",
              totalBalances: {
                "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
                  "6000319500347669370331",
              },
              data: {
                apy: "0.000000",
                totalApy: "0.0000",
                group: 2,
                lending: true,
                debt: false,
                collateral: true,
              },
            },
            {
              id: "8473bed540880f07b7f52c330103c870",
              totalBalances: {
                "0x057181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2":
                  "-900052389162082643600",
              },
              data: {
                apy: "0.001018",
                totalApy: "0.01018",
                group: 2,
                lending: false,
                debt: true,
                collateral: false,
              },
            },
            {
              id: "328e835168d876676f4360c32f9f9753",
              totalBalances: {
                "0x0772131070c7d56f78f3e46b27b70271d8ca81c7c52e3f62aa868fab4b679e43":
                  "11999999999999999999999",
              },
              data: {
                apy: "0.000000",
                totalApy: "0.0000",
                group: 3,
                lending: true,
                debt: false,
                collateral: true,
              },
            },
            {
              id: "7134500b8452fe18a841717346b7afdb",
              totalBalances: {
                "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
                  "-1278003947284119364",
              },
              data: {
                apy: "0.001000",
                totalApy: "0.01000",
                group: 3,
                lending: false,
                debt: true,
                collateral: false,
              },
            },
          ],
          type: "collateralizedDebtPosition",
        },
      ],
    },
    {
      dappId: "49007844-7a78-4185-be2f-b06bf6fc26a5",
      products: [
        {
          productId: "01a7b83d-d4c4-4109-af0d-ad5b15ab712b",
          name: "Staking",
          manageUrl:
            "https://app.avnu.fi/?tokenFrom=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&tokenTo=0x0703911a6196ef674fc635de02763dcd4ccc16d7cf736f68a9483cc44eccaa94",
          positions: [
            {
              id: "937a82be8c5c92d615fd851c82dc6f9f",
              investmentId: "f77d6ce4-a799-475d-920d-c76734e2f748",
              tokenAddress:
                "0x0703911a6196ef674fc635de02763dcd4ccc16d7cf736f68a9483cc44eccaa94",
              totalBalances: {
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7":
                  "17623790831667140",
              },
              data: {
                apy: "0.030927",
                totalApy: "0.050927",
              },
            },
          ],
          type: "staking",
        },
      ],
    },
  ],
}

export const stakedStrkOnlyDefiDecomposition: ApiDefiPositions = {
  dapps: [
    {
      dappId: "ed0f9636-9a73-49e0-9f80-0932eafd0cee",
      products: [
        {
          productId: "5d4c7689-6759-4051-a6a2-baf4a397b081",
          name: "Starknet Delegated Staking",
          manageUrl: "todo",
          positions: [
            {
              id: "c0c050e8fb19fe3434cb9b3a9f0a7571",
              investmentId: "ee3dae35-85ac-4e67-b3ee-4e436c102cba",
              totalBalances: {
                "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d":
                  "20000000000000000000",
              },
              data: {
                stakerInfo: {
                  name: "Argent",
                  iconUrl:
                    "https://static.argent.net/dapp/logos/3131edcd-b7f4-47d4-89ae-bd461786e547.png",
                  address:
                    "0x041dc48224a5f025d07a3d73d7ce73bb03c730c36b02646e6291d3e95ba4a7a4",
                },
                accruedRewards: "0",
                apy: "0.01621",
                totalApy: "0.01621",
              },
            },
          ],
          type: "strkDelegatedStaking",
        },
      ],
    },
  ],
}
