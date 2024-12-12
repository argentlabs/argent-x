import { z } from "zod"

/**
 * Enum representing the different contexts for starting the Ledger flow.
 *
 * @enum {string}
 * @property {string} create - Create a new multisig account with a Ledger device.
 * @property {string} join - Join an existing multisig account with a Ledger device.
 * @property {string} restore - Restore a multisig account with a Ledger device.
 * @property {string} replace - Replace an existing signer in a multisig account with a Ledger device.
 * @property {string} import - Import a standard (non-multisig) Ledger account.
 * @property {string} reconnect - Reconnect a previously connected Ledger device.
 */
export const ledgerStartContextSchema = z.enum([
  "create",
  "join",
  "restore",
  "replace",
  "import",
  "reconnect",
])

export type LedgerStartContext = z.infer<typeof ledgerStartContextSchema>
