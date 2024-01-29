import { ArrayStorage } from "../../storage"
import type { IRepository } from "../../storage/__new/interface"
import { adaptArrayStorage } from "../../storage/__new/repository"
import { isEqualPreAuthorization, type PreAuthorization } from "../schema"

export type IPreAuthorizationRepo = IRepository<PreAuthorization>

/**
 * @deprecated use `preAuthorizationRepo` instead
 */

export const preAuthorizationStore = new ArrayStorage<PreAuthorization>([], {
  namespace: `core:whitelist`,
  compare: isEqualPreAuthorization,
})

export const preAuthorizationRepo: IPreAuthorizationRepo = adaptArrayStorage(
  preAuthorizationStore,
)
