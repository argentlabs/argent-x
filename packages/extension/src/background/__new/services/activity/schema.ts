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
  type: z.enum(["token", "nft"]),
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
  network: z.enum(["starknet", "zksync", "zksync2"]),
  type: z.enum(["wallet", "token"]),
})

const networkDetailsSchema = z.object({
  chainId: z.enum(["TESTNET", "MAINNET"]),
  ethereumNetwork: z.enum(["goerli", "mainnet"]),
})

const typeSchema = z.enum([
  "approval",
  "changePubKey",
  "dappInteraction",
  "deploy",
  "gift",
  "multicall",
  "payment",
  "security",
  "trade",
])

const detailsActionSchema = z.enum([
  "triggerEscapeGuardian",
  "triggerEscapeSigner",
  "escapeGuardian",
  "escapeSigner",
  "guardianChanged",
  "guardianBackupChanged",
  "signerChanged",
  "cancelEscape",
  "accountUpgraded",
  "multisigConfigurationUpdated",
])

export const activityDetailsSchema = z.object({
  type: typeSchema,
  action: detailsActionSchema.optional(),
  context: z
    .object({
      activeAt: z.string().optional(),
      newGuardian: z.string().optional(),
      newImplementation: z.string().optional(),
      newVersion: z.string().optional(),
    })
    .optional(),
  srcAsset: assetSchema.optional(),
  destAsset: assetSchema.optional(),
})

export const activitySchema = z.object({
  compositeId: z.string(),
  id: z.string().uuid(),
  status: z.enum(["pending", "success", "failure"]),
  wallet: addressSchema,
  txSender: addressSchema,
  source: z.string(),
  type: typeSchema,
  group: z.enum(["finance", "security"]),
  submitted: z.number(),
  lastModified: z.number(),
  transaction: transactionSchema,
  transfers: z.array(transferSchema),
  // to be clarified
  fees: z.any(),
  relatedAddresses: z.array(relatedAddressSchema).nullable(),
  network: z.string(),
  networkDetails: networkDetailsSchema.optional(),
  details: activityDetailsSchema,
})

export const activitiesSchema = z.array(activitySchema)

export const activityResponseSchema = z.object({
  activities: activitiesSchema,
})

export type ActivityResponse = z.infer<typeof activityResponseSchema>
export type Activity = z.infer<typeof activitySchema>
export type ActivityDetailsAction = z.infer<typeof detailsActionSchema>

export function isActivityDetailsAction(
  value: unknown,
): value is ActivityDetailsAction {
  return detailsActionSchema.safeParse(value).success
}
