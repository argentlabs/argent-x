import { z } from "zod"
import {
  Call,
  CallDetails,
  RawArgs,
  RawArgsArray,
  RawArgsObject,
} from "starknet"

import { addressSchema } from "../../chains/starknet/address"

export const bigNumberishSchema = z.union([z.string(), z.number(), z.bigint()])

export const uint256Schema = z.object({
  low: bigNumberishSchema,
  high: bigNumberishSchema,
})

export const calldataSchema = z.array(z.string()).and(
  z
    .object({
      __compiled__: z.boolean().optional(),
    })
    .optional(),
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

export const feltSchema = z
  .string()
  .refine((v) => typeof parseInt(v) === "number")
/// Guardian
export const changeGuardianCalldataSchema = z.tuple([feltSchema])
export const escapeGuardianCalldataSchema = z.tuple([feltSchema])

/// Multisig
export const addOwnersCalldataSchema = z.object({
  new_threshold: z.string().refine((v) => typeof parseInt(v) === "number"),
  signers_to_add: z.array(feltSchema),
})
export const removeOwnersCalldataSchema = z.object({
  new_threshold: z.string().refine((v) => typeof parseInt(v) === "number"),
  signers_to_remove: z.array(feltSchema),
})
export const replaceSignerCalldataSchema = z.object({
  signer_to_remove: feltSchema,
  signer_to_add: feltSchema,
})
export const changeThresholdCalldataSchema = z.tuple([feltSchema])

/// Normal accounts

export const addPluginCalldataSchema = z.tuple([feltSchema])
export const removePluginCalldataSchema = z.tuple([feltSchema])
export const executeOnPluginCalldataSchema = z
  .tuple([feltSchema])
  .rest(feltSchema)
export const transferCalldataSchema = z.object({
  recipient: addressSchema,
  amount: z.object({
    low: bigNumberishSchema,
    high: bigNumberishSchema,
  }),
})
