import { bigNumberishSchema, callSchema } from "@argent/x-shared"
import type { CompiledContract } from "starknet"
import { TransactionType } from "starknet"
import { z } from "zod"

const declareContractPayloadSchema = z.object({
  contract: z
    .union([z.string(), z.any().transform((val) => val as CompiledContract)])
    .refine((val) => val !== undefined, "contract is required"), // Leave it to starknet.js to validate
  classHash: z.string().optional(),
  casm: z.any().optional(),
  compiledClassHash: z.string().optional(),
})

const deployAccountContractPayloadSchema = z.object({
  classHash: z.string(),
  constructorCalldata: z.any().optional(),
  addressSalt: bigNumberishSchema.optional(),
  contractAddress: z.string().optional(),
})

const universalDeployerContractPayloadSchema = z.object({
  classHash: bigNumberishSchema,
  salt: z.string().optional(),
  unique: z.boolean().optional(),
  constructorCalldata: z.any().optional(), // TODO: Parse RawArgs
})

export const accountDeployTransactionSchema = z.object({
  type: z.literal(TransactionType.DEPLOY_ACCOUNT),
  payload: deployAccountContractPayloadSchema,
})

export type AccountDeployTransaction = z.infer<
  typeof accountDeployTransactionSchema
>

export const invokeTransactionSchema = z.object({
  type: z.literal(TransactionType.INVOKE),
  payload: z.array(callSchema).or(callSchema),
})

export type InvokeTransaction = z.infer<typeof invokeTransactionSchema>

export const declareTransactionSchema = z.object({
  type: z.literal(TransactionType.DECLARE),
  payload: declareContractPayloadSchema,
})

export type DeclareTransaction = z.infer<typeof declareTransactionSchema>

export const deployTransactionSchema = z.object({
  type: z.literal(TransactionType.DEPLOY),
  payload: universalDeployerContractPayloadSchema,
})

export type DeployTransaction = z.infer<typeof deployTransactionSchema>

export const transactionActionSchema = z.union([
  accountDeployTransactionSchema,
  invokeTransactionSchema,
  declareTransactionSchema,
  deployTransactionSchema,
])
