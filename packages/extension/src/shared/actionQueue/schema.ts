import { z } from "zod"
import { addressSchema, investmentMetaSchema } from "@argent/x-shared"
import { simulateAndReviewSchema } from "@argent/x-shared/simulation"
import { swapReviewTradeSchema } from "../swap/model/trade.model"

export const actionHashSchema = z.string()
export type ActionHash = z.infer<typeof actionHashSchema>

export const deployActionExtraSchema = z.object({
  feeTokenAddress: addressSchema,
})

export type DeployActionExtra = z.infer<typeof deployActionExtraSchema>

export const actionItemExtraSchema = deployActionExtraSchema

export type ActionItemExtra = z.infer<typeof actionItemExtraSchema>

export const transactionIconKeysSchema = z.enum([
  "DocumentIcon",
  "RocketSecondaryIcon",
  "MultisigSecondaryIcon",
  "RemoveContactSecondaryIcon",
  "AddContactSecondaryIcon",
  "ApproveIcon",
  "CrossSecondaryIcon",
  "ShieldSecondaryIcon",
  "NoShieldSecondaryIcon",
  "SendSecondaryIcon",
  "SwapPrimaryIcon",
  "NftIcon",
  "NetworkSecondaryIcon",
  "MultisigReplaceIcon",
  "UpgradeSecondaryIcon",
  "InvestSecondaryIcon",
  "ArrowDownPrimaryIcon",
  "SparkleSecondaryIcon",
  "LegalPrimaryIcon",
])

export type TransactionIconKeys = z.infer<typeof transactionIconKeysSchema>

export const actionQueueItemMetaSchema = z.object({
  hash: actionHashSchema,
  expires: z.number(),
  origin: z.string().url().optional(),
  startedApproving: z.number().optional(),
  errorApproving: z.string().optional(),
  title: z.string().optional(),
  shortTitle: z.string().optional(),
  subtitle: z.string().optional(),
  icon: transactionIconKeysSchema.optional(),
  transactionReview: simulateAndReviewSchema.optional(),
  investment: investmentMetaSchema.optional(),
  reviewTrade: swapReviewTradeSchema.optional(),
})

export type ActionQueueItemMeta = z.infer<typeof actionQueueItemMetaSchema>

export const actionQueueItemSchema = z.object({
  meta: actionQueueItemMetaSchema,
})

export type ActionQueueItem = z.infer<typeof actionQueueItemSchema>
