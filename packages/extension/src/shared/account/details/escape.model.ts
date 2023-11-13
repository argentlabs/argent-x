import { z } from "zod"

/**
 * Cairo 0
 * https://github.com/argentlabs/argent-contracts-starknet/blob/main/contracts/account/library.cairo#L249-L250
 *
 * Cairo 1
 * https://github.com/argentlabs/argent-contracts-starknet-private/blob/develop/src/account/argent_account.cairo#L40-L45
 */

export const ESCAPE_TYPE_GUARDIAN = 1
export const ESCAPE_TYPE_SIGNER = 2
export const ESCAPE_SECURITY_PERIOD_DAYS = 7

export const escapeSchema = z.object({
  /** Time stamp escape will be active, in seconds */
  activeAt: z.number(),
  type: z.union([
    z.literal(ESCAPE_TYPE_GUARDIAN),
    z.literal(ESCAPE_TYPE_SIGNER),
  ]),
})

export type Escape = z.infer<typeof escapeSchema>
