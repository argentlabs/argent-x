import { z } from "zod"

const REGEX_HEXSTRING = /^0x[a-f0-9]+$/i
const REGEX_URL_WITH_LOCAL =
  /^(https?:\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/

export const networkStatusSchema = z.enum([
  "ok",
  "degraded",
  "error",
  "unknown",
])
export const networkSchema = z.object({
  id: z.string().min(2).max(31),
  name: z.string().min(2).max(128),
  chainId: z
    .string()
    .min(2)
    .max(31) // max 31 characters as required by starknet short strings
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "chain id must be hexadecimal string, uppercase alphanumeric or underscore, like 'SN_GOERLI'",
    }),
  baseUrl: z
    .string()
    .regex(REGEX_URL_WITH_LOCAL, "base url must be a valid URL"),

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
    }),
    z.undefined(),
  ]),
  explorerUrl: z.optional(
    z.string().regex(REGEX_URL_WITH_LOCAL, "explorer url must be a valid URL"),
  ),
  blockExplorerUrl: z.optional(
    z
      .string()
      .regex(REGEX_URL_WITH_LOCAL, "block explorer url must be a valid URL"),
  ),
  rpcUrl: z.optional(
    z.string().regex(REGEX_URL_WITH_LOCAL, "rpc url must be a valid URL"),
  ),
  multicallAddress: z.optional(
    z.string().regex(REGEX_HEXSTRING, "multicall address must be a valid URL"),
  ),
  readonly: z.optional(z.boolean()),
  status: networkStatusSchema,
})
