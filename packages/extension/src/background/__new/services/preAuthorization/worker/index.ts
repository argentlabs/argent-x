import { preAuthorizationRepo } from "../../../../../shared/preAuthorization/store"
import { PreAuthorisationWorker } from "./worker"

export const preAuthorisationWorker = new PreAuthorisationWorker(
  preAuthorizationRepo,
)
