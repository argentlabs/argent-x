import { CallSchema } from "@argent/x-window"
import { z } from "zod"
import { multisigDataSchema } from "../wallet.model"

export const pubkeySchema = z
  .string()
  .regex(/^[a-zA-Z0-9]{41,43}$/, "Incorrect signer pubkey")

export const ApiMultisigContentSchema = z.object({
  address: z.string(),
  creator: z.string(),
  signers: z.array(z.string()),
  threshold: z.number(),
})

export const ApiMultisigDataForSignerSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  content: z.array(ApiMultisigContentSchema),
})

export const ApiMultisigAccountDataSchema = z.object({
  content: ApiMultisigContentSchema,
})

export const ApiMultisigDataForSignerBatchSchema = z.array(
  ApiMultisigDataForSignerSchema,
)

export const ApiMultisigCallSchema = CallSchema

export const ApiMultisigTransactionSchema = z.object({
  maxFee: z.string(),
  nonce: z.string(),
  version: z.string(),
  calls: z.array(ApiMultisigCallSchema),
})

export const ApiMultisigStarknetSignature = z.object({
  r: z.string(),
  s: z.string(),
})

export const ApiMultisigPostRequestTxnSchema = z.object({
  creator: z.string(),
  transaction: ApiMultisigTransactionSchema,
  starknetSignature: ApiMultisigStarknetSignature,
})

export const ApiMultisigStateSchema = z.union([
  z.literal("AWAITING_SIGNATURES"),
  z.literal("SUBMITTING"),
  z.literal("SUBMITTED"),
  z.literal("TX_PENDING"),
  z.literal("TX_ACCEPTED_L2"),
  z.literal("COMPLETE"),
  z.literal("ERROR"),
  z.literal("CANCELLED"),
])

export const ApiMultisigTxnResponseSchema = z.object({
  content: z.object({
    id: z.string(),
    multisigAddress: z.string(),
    creator: z.string(),
    transaction: ApiMultisigTransactionSchema,
    nonce: z.number(),
    approvedSigners: z.array(z.string()),
    nonApprovedSigners: z.array(z.string()),
    state: ApiMultisigStateSchema,
    transactionHash: z.string().optional(),
  }),
})

export const ApiMultisigGetRequestsSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  content: z.array(
    z.object({
      id: z.string(),
      multisigAddress: z.string(),
      creator: z.string(),
      transaction: ApiMultisigTransactionSchema,
      nonce: z.number(),
      approvedSigners: z.array(z.string()),
      nonApprovedSigners: z.array(z.string()),
      state: ApiMultisigStateSchema,
      transactionHash: z.string().optional(),
    }),
  ),
})

export const ApiMultisigAddRequestSignatureSchema = z.object({
  signer: z.string(),
  starknetSignature: ApiMultisigStarknetSignature,
})

export type ApiMultisigContent = z.infer<typeof ApiMultisigContentSchema>
export type ApiMultisigDataForSigner = z.infer<
  typeof ApiMultisigDataForSignerSchema
>

export type ApiMultisigDataForSignerBatch = z.infer<
  typeof ApiMultisigDataForSignerBatchSchema
>

export type ApiMultisigAccountData = z.infer<
  typeof ApiMultisigAccountDataSchema
>

export type ApiMultisigCall = z.infer<typeof ApiMultisigCallSchema>
export type ApiMultisigTransaction = z.infer<
  typeof ApiMultisigTransactionSchema
>
export type ApiMultisigPostRequestTxn = z.infer<
  typeof ApiMultisigPostRequestTxnSchema
>

export type ApiMultisigGetRequests = z.infer<
  typeof ApiMultisigGetRequestsSchema
>
export type ApiMultisigState = z.infer<typeof ApiMultisigStateSchema>
export type ApiMultisigTxnResponse = z.infer<
  typeof ApiMultisigTxnResponseSchema
>
export type ApiMultisigAddRequestSignature = z.infer<
  typeof ApiMultisigAddRequestSignatureSchema
>

export const addAccountSchema = multisigDataSchema.extend({
  networkId: z.string(),
})

export type AddAccountPayload = z.infer<typeof addAccountSchema>

export const addOwnerMultisigSchema = z.object({
  address: z.string(),
  newThreshold: z.number(),
  signersToAdd: z.array(z.string()),
  currentThreshold: z.optional(z.number()),
})

export type AddOwnerMultisigPayload = z.infer<typeof addOwnerMultisigSchema>

export const removeOwnerMultisigSchema = z.object({
  address: z.string(),
  newThreshold: z.number(),
  signerToRemove: z.string(),
})

export type RemoveOwnerMultisigPayload = z.infer<
  typeof removeOwnerMultisigSchema
>

export const updateMultisigThresholdSchema = z.object({
  newThreshold: z.number(),
  address: z.string(),
})

export type UpdateMultisigThresholdPayload = z.infer<
  typeof updateMultisigThresholdSchema
>

export const replaceOwnerMultisigSchema = z.object({
  address: z.string(),
  signerToRemove: pubkeySchema,
  signerToAdd: pubkeySchema,
})

export type ReplaceOwnerMultisigPayload = z.infer<
  typeof replaceOwnerMultisigSchema
>
