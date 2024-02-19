import { actionQueue } from "../../../../shared/actionQueue"
import { feeTokenService } from "../../../../shared/feeToken/service"
import { respond } from "../../../respond"
import { walletSingleton } from "../../../walletSingleton"
import BackgroundActionService from "./background"

export const backgroundActionService = new BackgroundActionService(
  actionQueue,
  walletSingleton,
  feeTokenService,
  respond,
)
