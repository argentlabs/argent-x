import { z } from "zod"
import { addressSchema, bigNumberishSchema } from "@argent/x-shared"

const paramSchema = z.object({
  name: z.string(),
  type: z.string(),
})

const signatureTypeSchema = z.union([
  z.literal("StarknetDomain"),
  z.literal("OutsideExecution"),
  z.literal("OutsideCall"),
])

export type OutsideSignature = z.infer<typeof outsideSignatureSchema>

export const outsideCallSchema = z.object({
  to: addressSchema,
  selector: z.string(),
  calldata_len: bigNumberishSchema,
  calldata: z.array(bigNumberishSchema).nonempty().or(z.tuple([])), // can be an empty array
})

/**
 * Schema for validating the structure of an outside execution request message.
 * It includes the caller's address, nonce for replay protection, and a time window for execution.
 * The calls array contains the contract calls to be executed, which must be non-empty.
 * See https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-9.md#1-build-the-outsideexecution-struct
 */
export const outsideExecutionMessageSchema = z.object({
  caller: addressSchema, // The Starknet address of the caller
  nonce: bigNumberishSchema, // Nonce for replay protection
  execute_after: bigNumberishSchema, // Timestamp after which the execution is valid
  execute_before: bigNumberishSchema, // Timestamp before which the execution must occur
  calls: z.array(outsideCallSchema).nonempty(), // An array of contract calls or a single call
})

/** V2 - as above but with new key case e.g. `execute_before` -> `Execute Before` */

export const outsideCallSchemaV2 = z.object({
  To: addressSchema,
  Selector: z.string(),
  Calldata: z.array(bigNumberishSchema).nonempty().or(z.tuple([])), // can be an empty array
})

export const outsideExecutionMessageSchemaV2 = z.object({
  Caller: addressSchema, // The Starknet address of the caller
  Nonce: bigNumberishSchema, // Nonce for replay protection
  "Execute After": bigNumberishSchema, // Timestamp after which the execution is valid
  "Execute Before": bigNumberishSchema, // Timestamp before which the execution must occur
  Calls: z.array(outsideCallSchemaV2).nonempty(), // An array of contract calls or a single call
})

export const anyOutsideExecutionMessageSchema =
  outsideExecutionMessageSchema.or(outsideExecutionMessageSchemaV2)

export const outsideSignatureSchema = z.object({
  types: z.object({
    StarkNetDomain: z.array(paramSchema).optional(),
    OutsideExecution: z.array(paramSchema).optional(),
    OutsideCall: z.array(paramSchema).optional(),
  }),
  primaryType: signatureTypeSchema,
  domain: z
    .object({
      name: z.string(),
      version: z.string(),
      chainId: z.string(),
    })
    .optional(),
  message: anyOutsideExecutionMessageSchema,
})
