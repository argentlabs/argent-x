import { addressSchema, callSchema } from "@argent/x-shared"
import { typedDataSchema } from "@argent/x-window"
import { z } from "zod"
import { multisigDataSchema, signerTypeSchema } from "../wallet.model"

export const pubkeySchema = z
  .string()
  .regex(/^[a-zA-Z0-9]{41,43}$/, "Incorrect signer pubkey")

export const ApiMultisigContentSchema = z.object({
  address: z.string(),
  creator: addressSchema,
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

export const ApiMultisigCallSchema = callSchema

const ApiMultisigResourceBoundsSchema = z.object({
  l1_gas: z.object({
    max_amount: z.string(),
    max_price_per_unit: z.string(),
  }),
  l2_gas: z.object({
    max_amount: z.string(),
    max_price_per_unit: z.string(),
  }),
})

export const ApiMultisigTransactionSchema = z.object({
  maxFee: z.string().optional(),
  nonce: z.string(),
  version: z.string(),
  calls: z.array(ApiMultisigCallSchema),
  resource_bounds: ApiMultisigResourceBoundsSchema.optional(),
})

export const ApiMultisigStarknetSignature = z.object({
  r: z.string(),
  s: z.string(),
})

export const ApiMultisigPostRequestTxnSchema = z.object({
  creator: addressSchema,
  transaction: ApiMultisigTransactionSchema,
  starknetSignature: ApiMultisigStarknetSignature,
})

export const ApiMultisigTransactionStateSchema = z.union([
  z.literal("AWAITING_SIGNATURES"),
  z.literal("SUBMITTING"),
  z.literal("SUBMITTED"),
  z.literal("TX_PENDING"),
  z.literal("TX_ACCEPTED_L2"),
  z.literal("COMPLETE"),
  z.literal("ERROR"),
  z.literal("CANCELLED"),
  z.literal("REJECTED"), // this means that the tx was rejected by the sequencer, and the nonce was not consumed
  z.literal("REVERTED"),
])

export const ApiMultisigOffchainSignatureStateSchema = z.union([
  z.literal("AWAITING_SIGNATURES"),
  z.literal("SIGNATURE_THRESHOLD_REACHED"),
  z.literal("COMPLETE"),
  z.literal("CANCELLED"),
])

export const ApiMultisigTransactionResponseSchema = z.object({
  content: z.object({
    id: z.string(),
    multisigAddress: z.string(),
    creator: addressSchema,
    transaction: ApiMultisigTransactionSchema,
    nonce: z.number(),
    approvedSigners: z.array(z.string()),
    nonApprovedSigners: z.array(z.string()),
    state: ApiMultisigTransactionStateSchema,
    transactionHash: z.string().optional(),
  }),
})

export const ApiMultisigGetTrasactionRequestSchema = z.object({
  id: z.string(),
  multisigAddress: z.string(),
  creator: addressSchema,
  transaction: ApiMultisigTransactionSchema,
  nonce: z.number(),
  approvedSigners: z.array(z.string()),
  nonApprovedSigners: z.array(z.string()),
  state: ApiMultisigTransactionStateSchema,
  transactionHash: z.string().optional(),
})

export const ApiMultisigGetTransactionRequestsSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  content: z.array(ApiMultisigGetTrasactionRequestSchema),
})

export const ApiMultisigAddRequestSignatureSchema = z.object({
  signer: z.string(),
  starknetSignature: ApiMultisigStarknetSignature,
})

export type ApiMultisigRequest = z.infer<
  typeof ApiMultisigGetTrasactionRequestSchema
>
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

export type ApiMultisigGetTransactionRequests = z.infer<
  typeof ApiMultisigGetTransactionRequestsSchema
>

export type ApiMultisigTransactionState = z.infer<
  typeof ApiMultisigTransactionStateSchema
>
export type ApiMultisigTransactionResponse = z.infer<
  typeof ApiMultisigTransactionResponseSchema
>
export type ApiMultisigAddRequestSignature = z.infer<
  typeof ApiMultisigAddRequestSignatureSchema
>

export type ApiMultisigOffchainSignatureState = z.infer<
  typeof ApiMultisigOffchainSignatureStateSchema
>

export type ApiMultisigResourceBounds = z.infer<
  typeof ApiMultisigResourceBoundsSchema
>

export const addAccountSchema = multisigDataSchema.extend({
  signerType: signerTypeSchema.optional(),
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

export const typedDataToMessageSchema = typedDataSchema.transform((data) => ({
  type: "EIP712",
  content: data,
}))

export const offchainSigMessageSchema = z.object({
  type: z.literal("EIP712"),
  content: typedDataSchema,
})

export const createOffchainSignatureRequestSchema = z.object({
  creator: addressSchema,
  message: typedDataToMessageSchema,
  signature: ApiMultisigStarknetSignature,
})

export type CreateOffchainSignatureRequestPayload = z.infer<
  typeof createOffchainSignatureRequestSchema
>

export const multisigSignerSignatureSchema = z.object({
  signer: addressSchema,
  signature: ApiMultisigStarknetSignature,
})

export type MultisigSignerSignature = z.infer<
  typeof multisigSignerSignatureSchema
>

export const multisigSignerSignaturesSchema = z.array(
  multisigSignerSignatureSchema,
)

export type MultisigSignerSignatures = z.infer<
  typeof multisigSignerSignaturesSchema
>

// Should be of a type [creator, r, s, ...] or [requestId, signer, r, s, ...]
export const multisigArraySignatureSchema = z
  .array(z.string())
  .min(3, "Invalid signature format")

export type MultisigArraySignature = z.infer<
  typeof multisigArraySignatureSchema
>

export const multisigSignerSignaturesWithIdSchema = z.object({
  id: z.string(),
  signatures: multisigSignerSignaturesSchema,
})

export type MultisigSignerSignaturesWithId = z.infer<
  typeof multisigSignerSignaturesWithIdSchema
>

const baseMultisigOffchainSignatureSchema = z.object({
  id: z.string(),
  creator: addressSchema,
  multisigAddress: addressSchema,
  message: offchainSigMessageSchema,
  messageHash: z.string(),
  signatures: multisigSignerSignaturesSchema,
  approvedSigners: z.array(z.string()),
  nonApprovedSigners: z.array(z.string()),
  state: ApiMultisigOffchainSignatureStateSchema,
})

export const createOffchainSignatureResponseSchema = z.object({
  content: baseMultisigOffchainSignatureSchema,
})

export type CreateOffchainSignatureResponsePayload = z.infer<
  typeof createOffchainSignatureResponseSchema
>

export const apiMultisigGetSignatureRequestsSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  content: z.array(baseMultisigOffchainSignatureSchema),
})

export type ApiMultisigGetSignatureRequests = z.infer<
  typeof apiMultisigGetSignatureRequestsSchema
>

export const apiMultisigGetSignatureRequestByIdSchema = z.object({
  content: baseMultisigOffchainSignatureSchema,
})

export type ApiMultisigGetSignatureRequestById = z.infer<
  typeof apiMultisigGetSignatureRequestByIdSchema
>

export const apiMultisigCancelOffchainSignatureRequestSchema = z.object({
  state: ApiMultisigOffchainSignatureStateSchema,
  signer: addressSchema,
  signature: ApiMultisigStarknetSignature,
})

export type ApiMultisigCancelOffchainSignatureRequest = z.infer<
  typeof apiMultisigCancelOffchainSignatureRequestSchema
>
