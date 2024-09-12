import { z } from "zod"
// just using types here
// eslint-disable-next-line @argent/local/code-import-patterns
import { iconDeprecatedKeysSchema } from "@argent/x-ui"
import { simulateAndReviewSchema } from "@argent/x-shared/simulation"
import { addressSchema } from "@argent/x-shared"

export const actionHashSchema = z.string()
export type ActionHash = z.infer<typeof actionHashSchema>

export const deployActionExtraSchema = z.object({
  feeTokenAddress: addressSchema,
})

export type DeployActionExtra = z.infer<typeof deployActionExtraSchema>

export const actionItemExtraSchema = deployActionExtraSchema

export type ActionItemExtra = z.infer<typeof actionItemExtraSchema>

export const actionQueueItemMetaSchema = z.object({
  hash: actionHashSchema,
  expires: z.number(),
  origin: z.string().url().optional(),
  startedApproving: z.number().optional(),
  errorApproving: z.string().optional(),
  title: z.string().optional(),
  shortTitle: z.string().optional(),
  subtitle: z.string().optional(),
  icon: iconDeprecatedKeysSchema.optional(),
  transactionReview: simulateAndReviewSchema.optional(),
})

export type ActionQueueItemMeta = z.infer<typeof actionQueueItemMetaSchema>

export const actionQueueItemSchema = z.object({
  meta: actionQueueItemMetaSchema,
})

export type ActionQueueItem = z.infer<typeof actionQueueItemSchema>
