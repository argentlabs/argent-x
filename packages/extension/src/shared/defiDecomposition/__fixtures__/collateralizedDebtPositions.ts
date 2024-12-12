import type {
  ApiDefiDecompositionProduct,
  DefiPositionType,
} from "@argent/x-shared"

export const collateralizedDebtPositions: ApiDefiDecompositionProduct = {
  productId: "e287cf81-8b05-425c-875b-ef031498ad31",
  name: "Lending & Borrowing",
  manageUrl: "https://vesu-git-sepolia-vesu.vercel.app/positions/earn",
  groups: {
    "1": {
      healthRatio: "2.710918",
    },
    "2": {
      healthRatio: "4.930858",
    },
    "3": {
      healthRatio: "1.083022",
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
          "8000000099",
      },
      data: {
        apy: "0.000267",
        totalApy: "0.0567",
        collateral: false,
        lending: true,
        debt: false,
      },
    },
    {
      id: "73899a8006b1350ca8f5d093101cb6a3",
      investmentId: "43e1aa72-06f2-4db6-9fb2-675b3cb3fc82",
      tokenAddress:
        "0x05868ed6b7c57ac071bf6bfe762174a2522858b700ba9fb062709e63b65bf186",
      totalBalances: {
        "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca":
          "802342857167",
      },
      data: {
        apy: "0.000001",
        totalApy: "0.0001",
        collateral: false,
        lending: true,
        debt: false,
      },
    },
    {
      id: "342570c9e9bf2a788f75db3743f51e9c",
      totalBalances: {
        "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
          "8000000000008124586153",
      },
      data: {
        apy: "0.000000",
        totalApy: "0.0000",
        group: 1,
        collateral: true,
        lending: true,
        debt: false,
      },
    },
    {
      id: "d2f2e19ba29ce34b7461f0a5257c8fb1",
      totalBalances: {
        "0x063d32a3fa6074e72e7a1e06fe78c46a0c8473217773e19f11d8c8cbfc4ff8ca":
          "-9371429032",
      },
      data: {
        apy: "0.001001",
        totalApy: "0.01",
        group: 1,
        collateral: false,
        lending: false,
        debt: true,
      },
    },
    {
      id: "040e37d3d98432c500c743b20c250eb6",
      totalBalances: {
        "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
          "6000319500004940226185",
      },
      data: {
        apy: "0.000000",
        totalApy: "0.0000",
        group: 2,
        collateral: true,
        lending: true,
        debt: false,
      },
    },
    {
      id: "8473bed540880f07b7f52c330103c870",
      totalBalances: {
        "0x057181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2":
          "-900047986094880151114",
      },
      data: {
        apy: "0.001735",
        totalApy: "0.01735",
        group: 2,
        collateral: false,
        lending: false,
        debt: true,
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
        collateral: true,
        lending: true,
        debt: false,
      },
    },
    {
      id: "7134500b8452fe18a841717346b7afdb",
      totalBalances: {
        "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3":
          "-1278000056797272710",
      },
      data: {
        apy: "0.001000",
        totalApy: "0.01",
        group: 3,
        collateral: false,
        lending: false,
        debt: true,
      },
    },
  ],
  type: "collateralizedDebtPosition" as DefiPositionType,
}
