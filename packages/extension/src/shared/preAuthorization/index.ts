import { PreAuthorizationService } from "./PreAuthorizationService"
import { preAuthorizationRepo } from "./store"

export const preAuthorizationService = new PreAuthorizationService(
  preAuthorizationRepo,
)
