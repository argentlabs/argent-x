import type { ApiDefiDecompositionProduct } from "@argent/x-shared"

export const concentratedLiquidityPositions: ApiDefiDecompositionProduct = {
  productId: "1",
  name: "Concentrated liquidity",
  manageUrl: "https://app.ekubo.org/positions",
  positions: [
    {
      id: "050195914b6bb85dce82f3222c12154c",
      tokenAddress:
        "0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30",
      tokenId: "367273",
      totalBalances: {
        "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2":
          "1128442273967865732",
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7":
          "11107133261362",
      },
      data: {
        poolFeePercentage: "0.05",
        tickSpacingPercentage: "0.1",
        token0: {
          tokenAddress:
            "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
          principal: "1102394379714798486",
          accruedFees: "26047894253067246",
          minPrice: "0.000424331267348977",
          maxPrice: "0.000438129454574905",
          currentPrice: "0.000383264801039327",
        },
        token1: {
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          principal: "0",
          accruedFees: "11107133261362",
          minPrice: "2282.430431367024993961",
          maxPrice: "2356.649337314997410431",
          currentPrice: "2609.16211790967372508",
        },
      },
    },
    {
      id: "a7b7ebede0d38d62542727df7c1c2cfb",
      tokenAddress:
        "0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30",
      tokenId: "343207",
      totalBalances: {
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7":
          "158995656321138",
        "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2":
          "5469603",
      },
      data: {
        poolFeePercentage: "0.05",
        tickSpacingPercentage: "0.1",
        token0: {
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          principal: "0",
          accruedFees: "158995656321138",
          minPrice: "2487.493917",
          maxPrice: "2568.380972",
          currentPrice: "2604.665835",
        },
        token1: {
          tokenAddress:
            "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
          principal: "5066944",
          accruedFees: "402659",
          minPrice: "0.000389350338108608",
          maxPrice: "0.000402011033360373",
          currentPrice: "0.000383926408709454",
        },
      },
    },
  ],
  type: "concentratedLiquidityPosition",
}
