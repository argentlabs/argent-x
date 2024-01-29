import { PreAuthorizationService } from "./implementation"
import { preAuthorizationRepo } from "../store"

export const preAuthorizationService = new PreAuthorizationService(
  preAuthorizationRepo,
)
