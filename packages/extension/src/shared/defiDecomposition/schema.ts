import { productGroupsSchema, stakerInfoSchema } from "@argent/x-shared"
import { z } from "zod"
import { BaseTokenSchema } from "../token/__new/types/token.model"

const positionBaseTokenSchema = BaseTokenSchema.extend({
  balance: z.string(),
})

const positionTokenWithUsdValueSchema = positionBaseTokenSchema.extend({
  usdValue: z.string(),
})

export type PositionBaseToken = z.infer<typeof positionBaseTokenSchema>
export type PositionTokenWithUsdValue = z.infer<
  typeof positionTokenWithUsdValueSchema
>

const parsedConcentratedLiquidityTokenSchema = positionBaseTokenSchema.extend({
  principal: z.string(),
  accruedFees: z.string(),
  minPrice: z.string(),
  maxPrice: z.string(),
  currentPrice: z.string(),
})

const parsedConcentratedLiquidityTokenWithUsdValueSchema =
  parsedConcentratedLiquidityTokenSchema.extend({
    usdValue: z.string(),
  })

export const parsedConcentratedLiquidityPositionSchema = z.object({
  id: z.string(),
  poolFeePercentage: z.string(),
  tickSpacingPercentage: z.string().optional(),
  token0: parsedConcentratedLiquidityTokenSchema,
  token1: parsedConcentratedLiquidityTokenSchema,
  liquidityToken: BaseTokenSchema.optional(),
})

export const parsedConcentratedLiquidityPositionWithUsdValueSchema =
  parsedConcentratedLiquidityPositionSchema.extend({
    totalUsdValue: z.string(),
    token0: parsedConcentratedLiquidityTokenWithUsdValueSchema,
    token1: parsedConcentratedLiquidityTokenWithUsdValueSchema,
    liquidityToken: BaseTokenSchema.optional(),
  })

export const parsedConcentratedLiquidityPositionsWithUsdValueSchema = z.object({
  totalUsdValue: z.string(),
  positions: z.array(parsedConcentratedLiquidityPositionWithUsdValueSchema),
})

export type ParsedConcentratedLiquidityPosition = z.infer<
  typeof parsedConcentratedLiquidityPositionSchema
>
export type ParsedConcentratedLiquidityPositionWithUsdValue = z.infer<
  typeof parsedConcentratedLiquidityPositionWithUsdValueSchema
>
export type ParsedConcentratedLiquidityToken = z.infer<
  typeof parsedConcentratedLiquidityTokenSchema
>
export type ParsedConcentratedLiquidityTokenWithUsdValue = z.infer<
  typeof parsedConcentratedLiquidityTokenWithUsdValueSchema
>
export type ParsedConcentratedLiquidityPositionsWithUsdValue = z.infer<
  typeof parsedConcentratedLiquidityPositionsWithUsdValueSchema
>

export const parsedCollateralizedDebtLendingPositionSchema = z.object({
  id: z.string(),
  collateral: z.boolean(),
  debt: z.boolean(),
  lending: z.boolean(),
  apy: z.string().optional(),
  totalApy: z.string().optional(),
  group: z.string().optional(),
  token: positionBaseTokenSchema,
  liquidityToken: BaseTokenSchema.optional(),
})

const parsedCollateralizedDebtLendingPositionWithUsdValueSchema =
  parsedCollateralizedDebtLendingPositionSchema.extend({
    token: positionTokenWithUsdValueSchema,
  })

const parsedCollateralizedDebtBorrowingPositionSchema = z.object({
  id: z.string(),
  group: z.string(),
  healthRatio: z.string().optional(),
  collateralizedPositions: z.array(
    parsedCollateralizedDebtLendingPositionSchema,
  ),
  debtPositions: z.array(parsedCollateralizedDebtLendingPositionSchema),
})

export const parsedCollateralizedDebtBorrowingPositionWithUsdValueSchema =
  parsedCollateralizedDebtBorrowingPositionSchema.extend({
    totalUsdValue: z.string(),
    collateralizedPositions: z.array(
      parsedCollateralizedDebtLendingPositionWithUsdValueSchema,
    ),
    debtPositions: z.array(
      parsedCollateralizedDebtLendingPositionWithUsdValueSchema,
    ),
    collateralizedPositionsTotalUsdValue: z.string(),
    debtPositionsTotalUsdValue: z.string(),
  })

export const parsedCollateralizedDebtPositionSchema =
  parsedCollateralizedDebtLendingPositionSchema.or(
    parsedCollateralizedDebtBorrowingPositionSchema,
  )

export const parsedCollateralizedDebtPositionWithUsdValueSchema =
  parsedCollateralizedDebtLendingPositionWithUsdValueSchema.or(
    parsedCollateralizedDebtBorrowingPositionWithUsdValueSchema,
  )

export type ParsedCollateralizedDebtLendingPositionWithUsdValueSchema = z.infer<
  typeof parsedCollateralizedDebtPositionWithUsdValueSchema
>

export const parsedCollateralizedDebtPositionsWithUsdValueSchema = z.object({
  totalUsdValue: z.string(),
  positions: z.array(parsedCollateralizedDebtPositionWithUsdValueSchema),
})

export type ParsedCollateralizedDebtPosition = z.infer<
  typeof parsedCollateralizedDebtPositionSchema
>
export type ParsedCollateralizedDebtLendingPosition = z.infer<
  typeof parsedCollateralizedDebtLendingPositionSchema
>
export type ParsedCollateralizedDebtPositionWithUsdValue = z.infer<
  typeof parsedCollateralizedDebtLendingPositionWithUsdValueSchema
>
export type ParsedCollateralizedDebtBorrowingPosition = z.infer<
  typeof parsedCollateralizedDebtBorrowingPositionSchema
>
export type ParsedCollateralizedDebtBorrowingPositionWithUsdValue = z.infer<
  typeof parsedCollateralizedDebtBorrowingPositionWithUsdValueSchema
>
export type ParsedCollateralizedDebtPositionsWithUsdValue = z.infer<
  typeof parsedCollateralizedDebtPositionsWithUsdValueSchema
>

const parsedStakingPositionSchema = z.object({
  id: z.string(),
  apy: z.string(),
  totalApy: z.string().optional(),
  token: positionBaseTokenSchema,
  liquidityToken: BaseTokenSchema.optional(),
})

const parsedStakingPositionWithUsdValueSchema =
  parsedStakingPositionSchema.extend({
    token: positionTokenWithUsdValueSchema,
  })

export const parsedStakingPositionsWithUsdValueSchema = z.object({
  totalUsdValue: z.string(),
  positions: z.array(parsedStakingPositionWithUsdValueSchema),
})

export type ParsedStakingPosition = z.infer<typeof parsedStakingPositionSchema>
export type ParsedStakingPositionWithUsdValue = z.infer<
  typeof parsedStakingPositionWithUsdValueSchema
>
export type ParsedStakingPositionsWithUsdValue = z.infer<
  typeof parsedStakingPositionsWithUsdValueSchema
>

const parsedStrkDelegatedStakingPositionSchema = z.object({
  id: z.string(),
  investmentId: z.string(),
  stakerInfo: stakerInfoSchema,
  pendingWithdrawal: z
    .object({
      amount: z.string(),
      withdrawableAfter: z.number(),
    })
    .optional(),
  accruedRewards: z.string(),
  stakedAmount: z.string(),
  apy: z.string().optional(),
  totalApy: z.string().optional(),
  token: positionBaseTokenSchema,
})

const parsedStrkDelegatedStakingPositionWithUsdValueSchema =
  parsedStrkDelegatedStakingPositionSchema.extend({
    token: positionTokenWithUsdValueSchema,
  })

export const parsedStrkDelegatedStakingPositionsWithUsdValueSchema = z.object({
  totalUsdValue: z.string(),
  positions: z.array(parsedStrkDelegatedStakingPositionWithUsdValueSchema),
})

export type ParsedStrkDelegatedStakingPosition = z.infer<
  typeof parsedStrkDelegatedStakingPositionSchema
>
export type ParsedStrkDelegatedStakingPositionWithUsdValue = z.infer<
  typeof parsedStrkDelegatedStakingPositionWithUsdValueSchema
>
export type ParsedStrkDelegatedStakingPositionsWithUsdValue = z.infer<
  typeof parsedStrkDelegatedStakingPositionsWithUsdValueSchema
>

const parsedDelegatedTokensPositionSchema = z.object({
  id: z.string(),
  delegatingTo: z.string(),
  token: positionBaseTokenSchema,
  liquidityToken: BaseTokenSchema.optional(),
})

export const parsedDelegatedTokensPositionWithUsdValueSchema =
  parsedDelegatedTokensPositionSchema.extend({
    token: positionTokenWithUsdValueSchema,
  })

export const parsedDelegatedTokensPositionsWithUsdValueSchema = z.object({
  totalUsdValue: z.string(),
  positions: z.array(parsedDelegatedTokensPositionWithUsdValueSchema),
})

export type ParsedDelegatedTokensPosition = z.infer<
  typeof parsedDelegatedTokensPositionSchema
>
export type ParsedDelegatedTokensPositionWithUsdValue = z.infer<
  typeof parsedDelegatedTokensPositionWithUsdValueSchema
>
export type ParsedDelegatedTokensPositionsWithUsdValue = z.infer<
  typeof parsedDelegatedTokensPositionsWithUsdValueSchema
>

export const parsedPositionSchema = parsedConcentratedLiquidityPositionSchema
  .or(parsedCollateralizedDebtPositionSchema)
  .or(parsedDelegatedTokensPositionSchema)
  .or(parsedStrkDelegatedStakingPositionSchema)
  .or(parsedStakingPositionSchema)

export const parsedPositionWithUsdValueSchema =
  parsedConcentratedLiquidityPositionWithUsdValueSchema
    .or(parsedCollateralizedDebtPositionWithUsdValueSchema)
    .or(parsedDelegatedTokensPositionWithUsdValueSchema)
    .or(parsedStrkDelegatedStakingPositionWithUsdValueSchema)
    .or(parsedStakingPositionWithUsdValueSchema)

// redeclaring the product type because we split collateralizedDebtPosition into lending and borrowing
export const argentDefiPositionTypeSchema = z.union([
  z.literal("concentratedLiquidityPosition"),
  z.literal("collateralizedDebtLendingPosition"),
  z.literal("collateralizedDebtBorrowingPosition"),
  z.literal("delegatedTokens"),
  z.literal("strkDelegatedStaking"),
  z.literal("staking"),
])

export const parsedProductSchema = z.object({
  type: argentDefiPositionTypeSchema,
  productId: z.string().optional(),
  manageUrl: z.string().url().optional(),
  name: z.string(),
  positions: z.array(parsedPositionSchema),
  groups: productGroupsSchema.optional(),
})

export const parsedProductWithUsdValueSchema = parsedProductSchema.extend({
  positions: z.array(parsedPositionWithUsdValueSchema),
  totalUsdValue: z.string(),
})

export const parsedDefiDecompositionItemSchema = z.object({
  dappId: z.string(),
  products: z.array(parsedProductSchema),
})

export const parsedDefiDecompositionSchema = z.array(
  parsedDefiDecompositionItemSchema,
)

export const parsedDefiDecompositionItemWithUsdValueSchema =
  parsedDefiDecompositionItemSchema.extend({
    dappId: z.string(),
    products: z.array(parsedProductWithUsdValueSchema),
    totalUsdValue: z.string(),
  })

export const parsedDefiDecompositionWithUsdValueSchema = z.array(
  parsedDefiDecompositionItemWithUsdValueSchema,
)

export type ParsedDefiDecompositionItem = z.infer<
  typeof parsedDefiDecompositionItemSchema
>

export type ParsedDefiDecompositionItemWithUsdValue = z.infer<
  typeof parsedDefiDecompositionItemWithUsdValueSchema
>

export type ParsedDefiDecomposition = z.infer<
  typeof parsedDefiDecompositionSchema
>

export type ParsedProduct = z.infer<typeof parsedProductSchema>
export type ParsedPosition = z.infer<typeof parsedPositionSchema>

export type ParsedPositionWithUsdValue = z.infer<
  typeof parsedPositionWithUsdValueSchema
>
export type ParsedProductWithUsdValue = z.infer<
  typeof parsedProductWithUsdValueSchema
>
export type ParsedDefiDecompositionWithUsdValue = z.infer<
  typeof parsedDefiDecompositionWithUsdValueSchema
>

export const isCollateralizedDebtLendingPosition = (
  position: unknown,
): position is ParsedCollateralizedDebtLendingPosition => {
  return parsedCollateralizedDebtLendingPositionSchema.safeParse(position)
    .success
}

export const isCollateralizedDebtBorrowingPosition = (
  position: unknown,
): position is ParsedCollateralizedDebtBorrowingPosition => {
  return parsedCollateralizedDebtBorrowingPositionSchema.safeParse(position)
    .success
}

export const isCollateralizedDebtPosition = (
  position: unknown,
): position is ParsedCollateralizedDebtPosition => {
  return parsedCollateralizedDebtPositionSchema.safeParse(position).success
}

export const isDelegatedTokensPosition = (
  position: unknown,
): position is ParsedDelegatedTokensPosition => {
  return parsedDelegatedTokensPositionSchema.safeParse(position).success
}

export const isStakingPosition = (
  position: unknown,
): position is ParsedStakingPosition => {
  return parsedStakingPositionSchema.safeParse(position).success
}

export const isStrkDelegatedStakingPosition = (
  position: unknown,
): position is ParsedStrkDelegatedStakingPosition => {
  return parsedStrkDelegatedStakingPositionSchema.safeParse(position).success
}

export const isConcentratedLiquidityPosition = (
  position: unknown,
): position is ParsedConcentratedLiquidityPosition => {
  return parsedConcentratedLiquidityPositionSchema.safeParse(position).success
}
