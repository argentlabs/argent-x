import { addressSchema } from "@argent/shared"
import { z } from "zod"

const transactionSchema = z.object({
  network: z.string(),
  hash: z.string(),
  status: z.string(),
  blockNumber: z.number().optional(),
  transactionIndex: z.number(),
})

const assetSchema = z.object({
  // probably an enum
  type: z.string(),
  tokenAddress: addressSchema,
  amount: z.string().optional(),
  fiatAmount: z
    .object({
      currency: z.string(),
      currencyAmount: z.number(),
    })
    .optional(),
})

const transferSchema = z.object({
  // seems to be the same as activity type
  type: z.string(),
  // is probably enum (credit)
  leg: z.string(),
  counterParty: addressSchema.optional(),
  asset: assetSchema,
  counterPartyNetwork: z.string().optional(),
})

const relatedAddressSchema = z.object({
  address: addressSchema,
  network: z.string(),
  type: z.string(),
})

export const activitySchema = z.object({
  compositeId: z.string(),
  id: z.string().uuid(),
  // todo can be refined
  status: z.string(),
  wallet: addressSchema,
  txSender: addressSchema,
  source: z.string(),
  // can be refined ('payment')
  type: z.string(),
  // can be refined ('finance')
  group: z.string(),
  submitted: z.number(),
  lastModified: z.number(),
  transaction: transactionSchema,
  transfers: z.array(transferSchema),
  // to be clarified
  fees: z.any(),
  relatedAddresses: z.array(relatedAddressSchema),
  network: z.string(),
})

export const activityResponseSchema = z.object({
  activities: z.array(activitySchema),
})

export type ActivityResponse = z.infer<typeof activityResponseSchema>
export type Activity = z.infer<typeof activitySchema>
