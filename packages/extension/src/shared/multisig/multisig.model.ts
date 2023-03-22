import { InvokeFunctionResponse } from "starknet"
import { z } from "zod"

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

export const ApiMultisigCallSchema = z.object({
  contractAddress: z.string(),
  entrypoint: z.string(),
  calldata: z.array(z.string()).optional(),
})

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
  signature: ApiMultisigStarknetSignature,
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

export interface MultisigInvokeResponse extends InvokeFunctionResponse {
  requestId: string
  creator: string
}

export const ApiMultisigAddRequestSignatureSchema = z.object({
  signer: z.string(),
  starknetSignature: ApiMultisigStarknetSignature,
})

export type ApiMultisigContent = z.infer<typeof ApiMultisigContentSchema>
export type ApiMultisigDataForSigner = z.infer<
  typeof ApiMultisigDataForSignerSchema
>
export type ApiMultisigCall = z.infer<typeof ApiMultisigCallSchema>
export type ApiMultisigTransaction = z.infer<
  typeof ApiMultisigTransactionSchema
>
export type ApiMultisigPostRequestTxn = z.infer<
  typeof ApiMultisigPostRequestTxnSchema
>
export type ApiMultisigState = z.infer<typeof ApiMultisigStateSchema>
export type ApiMultisigTxnResponse = z.infer<
  typeof ApiMultisigTxnResponseSchema
>
export type ApiMultisigAddRequestSignature = z.infer<
  typeof ApiMultisigAddRequestSignatureSchema
>
