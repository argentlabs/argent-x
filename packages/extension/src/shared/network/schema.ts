import { addressOrEmptyUndefinedSchema, addressSchema } from "@argent/x-shared"
import { z } from "zod"
import { constants } from "starknet"

const REGEX_HEXSTRING = /^0x[a-f0-9]+$/i

export const baseNetworkSchema = z.object({
  id: z.string().min(2).max(31),
})

export const colorStatusSchema = z.enum(["red", "amber", "green", "unknown"])

export const mainnetChainIdSchema = z
  .string()
  .transform((t) => t.toUpperCase())
  .pipe(
    z.enum([
      constants.NetworkName.SN_MAIN,
      constants.StarknetChainId.SN_MAIN.toUpperCase(),
    ]),
  )

export const chainIdSchema = z
  .string()
  .min(2, "ChainId must be at least 2 characters")
  .max(31, "ChainId cannot be longer than 31 characters") // max 31 characters as required by starknet short strings
  .regex(/^[a-zA-Z0-9_]+$/, {
    message:
      "chain id must be hexadecimal string, uppercase alphanumeric or underscore, like 'SN_ABCXYZ'",
  })

export const notMainnetChainIdSchema = chainIdSchema.refine(
  (value) => {
    return !mainnetChainIdSchema.safeParse(value).success
  },
  {
    message: "Chain ID is reserved",
  },
)

export const networkSchema = baseNetworkSchema.extend({
  name: z.string().min(2).max(128),
  chainId: chainIdSchema,
  rpcUrl: z.string().url("RPC url must be a valid URL"),
  possibleFeeTokenAddresses: z.array(addressSchema).nonempty(), // z.array(addressSchema).min(1) but with better type
  accountImplementation: z.optional(
    z.string().regex(REGEX_HEXSTRING, {
      message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
    }),
  ),
  accountClassHash: z.union([
    z.object({
      standard: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      standardCairo0: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      plugin: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      multisig: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      betterMulticall: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      argent5MinuteEscapeTestingAccount: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
      smart: z
        .string()
        .regex(REGEX_HEXSTRING, {
          message: `Account class hash must match the following: /^0x[a-f0-9]+$/i`,
        })
        .optional(),
    }),
    z.undefined(),
  ]),
  explorerUrl: z.optional(z.string().url("explorer url must be a valid URL")),
  faucetUrl: z.optional(z.string().url("faucet url must be a valid URL")),
  l1ExplorerUrl: z.optional(
    z.string().url("l1 explorer url must be a valid URL"),
  ),
  blockExplorerUrl: z.optional(
    z.string().url("block explorer url must be a valid URL"),
  ),
  multicallAddress: addressOrEmptyUndefinedSchema,
  readonly: z.optional(z.boolean()),
})

export const notMainnetChainIdNetworkSchema = networkSchema.extend({
  chainId: notMainnetChainIdSchema,
})

export const networkWithStatusSchema = z.object({
  id: z.string(),
  status: colorStatusSchema,
})
