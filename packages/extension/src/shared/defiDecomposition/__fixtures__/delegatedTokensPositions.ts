import type { ApiDefiDecompositionProduct } from "@argent/x-shared"

export const delegatedTokensPositions: ApiDefiDecompositionProduct = {
  productId: "1",
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
}
