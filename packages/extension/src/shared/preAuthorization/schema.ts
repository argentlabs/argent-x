import { accountsEqual } from "../utils/accountsEqual"
import { baseWalletAccountSchema } from "../wallet.model"
import { z } from "zod"

export const preAuthorizationHostSchema = z.string().url()

export const preAuthorizationSchema = z.object({
  account: baseWalletAccountSchema,
  host: preAuthorizationHostSchema,
})

export type PreAuthorization = z.infer<typeof preAuthorizationSchema>

export function isEqualPreAuthorization(
  a: Partial<PreAuthorization>,
  b?: Partial<PreAuthorization>,
) {
  try {
    if (!b) {
      return false
    }
    return accountsEqual(a.account, b.account) && a.host === b.host
  } catch {
    // ignore parsing error
  }
  return false
}
