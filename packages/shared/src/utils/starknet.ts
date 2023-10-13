import { z } from "zod"
import {
  Call,
  CallDetails,
  RawArgs,
  RawArgsArray,
  RawArgsObject,
} from "starknet"

export const bigNumberishSchema = z.union([z.string(), z.number(), z.bigint()])

export const uint256Schema = z.object({
  low: bigNumberishSchema,
  high: bigNumberishSchema,
})

export const calldataSchema = z.array(z.string()).and(
  z.object({
    __compiled__: z.boolean().optional(),
  }),
)

export const rawArgsArraySchema: z.ZodSchema<RawArgsArray> = z.lazy(() =>
  z.array(z.union([multiTypeSchema, z.array(multiTypeSchema), rawArgsSchema])),
)

export const multiTypeSchema = z.union([
  bigNumberishSchema,
  uint256Schema,
  z.any(),
  z.boolean(),
])

export const rawArgsObjectSchema: z.ZodSchema<RawArgsObject> = z.lazy(() =>
  z.record(z.union([multiTypeSchema, z.array(multiTypeSchema), rawArgsSchema])),
)

export const rawArgsSchema: z.ZodSchema<RawArgs> = z.lazy(() =>
  z.union([rawArgsObjectSchema, rawArgsArraySchema]),
)

export const callDetailsSchema: z.ZodSchema<CallDetails> = z.lazy(() =>
  z.object({
    contractAddress: z.string(),
    calldata: z.union([rawArgsSchema, calldataSchema]).optional(),
    entrypoint: z.string().optional(),
  }),
)

export const callSchema: z.ZodSchema<Call> = z.lazy(() =>
  callDetailsSchema.and(
    z.object({
      entrypoint: z.string(),
    }),
  ),
)
