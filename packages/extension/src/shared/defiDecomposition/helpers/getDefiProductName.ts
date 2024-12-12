const productTypeNameMap: Record<string, string> = {
  concentratedLiquidityPosition: "Providing liquidity",
  collateralizedDebtLendingPosition: "Lending",
  collateralizedDebtBorrowingPosition: "Borrowing",
  delegatedTokens: "Delegated governance",
  strkDelegatedStaking: "Native staking",
  staking: "Liquid staking",
}

export const getProductTypeName = (type: string): string => {
  return productTypeNameMap[type] || "Unknown"
}
