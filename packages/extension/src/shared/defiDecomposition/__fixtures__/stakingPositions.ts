import type { ApiDefiDecompositionProduct } from "@argent/x-shared"

export const stakingPositions: ApiDefiDecompositionProduct = {
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
          "17431798489347591",
      },
      data: {
        apy: "0.03192",
        totalApy: "0.03192",
      },
    },
  ],
  type: "staking",
}
