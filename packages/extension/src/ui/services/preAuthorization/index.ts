import { preAuthorizationService } from "../../../shared/preAuthorization"
import { messageClient } from "../trpc"
import { PreAuthorizationUIService } from "./PreAuthorizationUIService"

export const preAuthorizationUIService = new PreAuthorizationUIService(
  messageClient,
  preAuthorizationService,
)
